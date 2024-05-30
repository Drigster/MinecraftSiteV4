import { setError, superValidate } from "sveltekit-superforms";
import { fail, redirect } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";
import bcrypt from "bcrypt";
import { DateTime } from "luxon";
import db from "$lib/db.js";
import { generateToken } from "$lib/util.server";

const schema = z.object({
	username: z.string().min(1, "Никнейм не может быть пустым"),
	password: z.string().min(1, "Пароль не может быть пустым"),
});

export const load = async ({ cookies }) => {
	const token = cookies.get("sessionToken");
	let hasToken = false;
	if (token != undefined) {
		const session = await db.session.findUnique({
			where: {
				token,
			},
		});

		if (session != undefined && session.expiresAt >= DateTime.now().toJSDate()) {
			hasToken = true;
		}
	}

	const form = await superValidate(zod(schema));

	return { form, hasToken };
};

export const actions = {
	default: async ({ request, cookies, url, getClientAddress }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			// Again, return { form } and things will just work.
			return fail(400, { form });
		}

		const user = await db.user.findFirst({
			where: {
				OR: [
					{
						username: {
							equals: form.data.username,
							mode: "insensitive",
						},
					},
					{
						email: {
							equals: form.data.username,
							mode: "insensitive",
						},
					},
				],
			},
		});

		if (user == null) {
			return setError(form, "username", "Пользователь не найден!");
		} else if (!bcrypt.compareSync(form.data.password + user.uuid, user.password)) {
			return setError(form, "password", "Пароль не верен!");
		}

		await db.session.deleteMany({
			where: {
				userId: user.id,
				expiresAt: {
					lte: new Date(),
				},
			},
		});

		const token = cookies.get("sessionToken");
		let session = null;

		if (token != undefined) {
			session = await db.session.findUnique({
				where: {
					token: token,
				},
			});
		}

		if (session === null || session.expiresAt <= DateTime.now().toJSDate()) {
			session = await db.session.create({
				data: {
					token: generateToken(),
					refreshToken: generateToken(),
					expiresAt: DateTime.now().plus({ week: 1 }).toJSDate(),
					userId: user.id,
					name: "Site",
					ip: getClientAddress(),
				},
			});

			cookies.set("sessionToken", session.token, { path: "/", expires: session.expiresAt });
		}

		const redirectTo = url.searchParams.get("redirectTo");
		if (redirectTo != null) {
			return redirect(303, redirectTo);
		}

		return redirect(303, "/profile");
	},
};
