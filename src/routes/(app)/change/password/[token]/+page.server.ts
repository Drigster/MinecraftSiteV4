import { setError, setMessage, superValidate } from "sveltekit-superforms";
import { fail } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";
import bcrypt from "bcrypt";
import db from "$lib/db.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "$env/static/private";

const schema = z.object({
	password: z.string().min(1, "Пароль не может быть пустым"),
	password2: z.string().min(1, "Пароль не может быть пустым"),
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

		if (form.data.password != form.data.password2) {
			return setError(form, "password", "Пароли не совпадают!");
		}

		user = await db.user.update({
			where: {
				id: user.id,
			},
			data: {
				salted: true,
				salt: user.uuid.replaceAll("-", ""),
				password: bcrypt.hashSync(form.data.password + user.uuid.replaceAll("-", ""), 12),
			},
		});

		await db.session.deleteMany({
			where: {
				userId: user.id,
			},
		});

		return setMessage(form, "Пароль успешно изменён!");
	},
};
