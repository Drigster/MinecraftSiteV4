import { setError, setMessage, superValidate } from "sveltekit-superforms";
import { fail } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";
import { validate } from "deep-email-validator";
import { db } from "$lib/db";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "$env/static/private";

const schema = z.object({
	email: z.string().email(),
});

export const load = async ({ params }) => {
	const form = await superValidate(zod(schema));

	let token;
	try {
		token = jwt.verify(params.token, JWT_SECRET) as jwt.JwtPayload;
	} catch {
		setMessage(form, "Время запроса истекло!");
	}

	if (token != undefined) {
		const user = await db
			.selectFrom("User")
			.where("email", "=", token.email)
			.executeTakeFirst();

		if (user == null) {
			setMessage(form, "Пользователь не найден!");
		}
	}

	return { form };
};

export const actions = {
	default: async ({ request, params }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		let token;
		try {
			token = jwt.verify(params.token, JWT_SECRET, {
				ignoreExpiration: true,
			}) as jwt.JwtPayload;
		} catch {
			return setMessage(form, "Время запроса истекло!");
		}

		const user = await db
			.selectFrom("User")
			.select("id")
			.where("email", "=", token.email)
			.executeTakeFirst();

		if (user == null) {
			return setMessage(form, "Token is invalid");
		}

		const res = await validate(form.data.email);
		if (!res.valid) {
			switch (res.reason) {
				case "regex":
					return setError(form, "email", "Неверный формат почты!");
				case "disposable":
					return setError(
						form,
						"email",
						"Временные почты запрещены!",
					);
				case "typo":
				case "mx":
				case "smtp":
					return setError(
						form,
						"email",
						"Почта не существует или не действительна!",
					);
				default:
					break;
			}
		}

		await db
			.updateTable("User")
			.where("id", "=", user.id)
			.set({
				email: form.data.email,
			})
			.execute();

		return setMessage(form, "Пароль успешно изменён!");
	},
};
