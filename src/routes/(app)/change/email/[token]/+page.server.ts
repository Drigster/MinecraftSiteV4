import { setError, setMessage, superValidate } from "sveltekit-superforms";
import { fail } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";
import db from "$lib/db.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "$env/static/private";
import { validate } from "deep-email-validator";

const schema = z.object({
	email: z.string().email(),
});

export const load = async ({ params }) => {
	const form = await superValidate(zod(schema));

	let token;
	try {
		token = jwt.verify(params.token, JWT_SECRET) as jwt.JwtPayload;
	} catch (error) {
		setMessage(form, "Время запроса истекло!");
	}

	if (token != undefined) {
		const user = await db.user.findUnique({
			where: {
				email: token.email,
			},
		});

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
		} catch (error) {
			return setMessage(form, "Время запроса истекло!");
		}

		let user = await db.user.findFirst({
			where: {
				email: {
					equals: token.email,
					mode: "insensitive",
				},
			},
		});

		if (user == null) {
			return setMessage(form, "Token is invalid");
		}

		const res = await validate(form.data.email);
		if (!res.valid) {
			switch (res.reason) {
				case "regex":
					return setError(form, "email", "Неверный формат почты!");
				case "disposable":
					return setError(form, "email", "Временные почты запрещены!");
				case "typo":
				case "mx":
				case "smtp":
					return setError(form, "email", "Почта не существует или не действительна!");
				default:
					break;
			}
		}

		user = await db.user.update({
			where: {
				id: user.id,
			},
			data: {
				email: form.data.email,
			},
		});

		return setMessage(form, "Пароль успешно изменён!");
	},
};
