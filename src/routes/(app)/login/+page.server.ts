import { setError, superValidate } from "sveltekit-superforms";
import { fail, redirect } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";
import bcrypt from "bcrypt";
import { db } from "$lib/db";
import { lucia } from "$lib/server/auth";
import { createLuciaSession } from "$lib/util.server.js";

const schema = z.object({
	login: z.string().min(1, "Никнейм не может быть пустым"),
	password: z.string().min(1, "Пароль не может быть пустым"),
});

export const load = async ({ locals }) => {
	if (locals.user != null) redirect(302, "/profile");

	const form = await superValidate(zod(schema));

	return { form };
};

export const actions = {
	default: async ({ request, cookies, url }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const user = await db
			.selectFrom("User")
			.selectAll()
			.where((eb) =>
				eb.or([
					eb("username", "=", form.data.login),
					eb("email", "=", form.data.login),
				]),
			)
			.executeTakeFirst();

		if (user == null) {
			return setError(form, "login", "Пользователь не найден!");
		}

		if (user.salted) {
			if (
				!bcrypt.compareSync(
					form.data.password + user.salt,
					user.password,
				)
			) {
				return setError(form, "password", "Пароль не верен!");
			}
		} else if (!bcrypt.compareSync(form.data.password, user.password)) {
			return setError(form, "password", "Пароль не верен!");
		}

		if (!user.salted) {
			await db
				.updateTable("User")
				.where("id", "=", user.id)
				.set({
					salted: true,
					salt: user.uuid.replaceAll("-", ""),
					password: bcrypt.hashSync(
						form.data.password + user.uuid.replaceAll("-", ""),
						12,
					),
				})
				.execute();
		}

		const session = await createLuciaSession(
			request.headers.get("X-Real-IP"),
			user.id,
			request.headers.get("User-Agent")!,
			"SITE",
		);

		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: "/",
			...sessionCookie.attributes,
		});

		const redirectTo = url.searchParams.get("redirectTo");
		if (redirectTo != null) {
			return redirect(303, redirectTo);
		}
		return redirect(303, "/profile");
	},
};
