import { setError, superValidate } from "sveltekit-superforms";
import { fail, redirect } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";
import bcrypt from "bcrypt";
import db from "$lib/db.js";
import { v4 as uuidv4 } from "uuid";
import { validate } from "deep-email-validator";
import { sendVerificationEmail } from "$lib/util.server.js";

const schema = z.object({
	username: z
		.string()
		.min(1, "Никнейм не может быть пустым")
		.max(16, "Никнейм не может быть длинее 16 символов")
		.regex(/[a-zA-Z0-9_]+/, "Никнейм имеет недопустимые символы"),
	email: z.string().email(),
	password: z.string().min(1, "Пароль не может быть пустым"),
	password2: z.string().min(1, "Пароль не может быть пустым"),
});

export const load = async () => {
	const form = await superValidate(zod(schema));

	return { form };
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		let user = await db.user.findFirst({
			where: {
				OR: [
					{
						username: form.data.username,
					},
					{
						email: form.data.email,
					},
				],
			},
		});

		if (user != null) {
			if (user.username == form.data.username) {
				return setError(form, "username", "Никнейм занят!");
			} else if (user.email == form.data.email) {
				return setError(form, "email", "Почта занята!");
			}
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

		if (form.data.password != form.data.password2) {
			return setError(form, "password", "Пароли не совпадают!");
		}

		const uuid = uuidv4();
		const salt = uuid.replaceAll("-", "");
		user = await db.user.create({
			data: {
				uuid: uuid,
				email: form.data.email,
				username: form.data.username,
				password: bcrypt.hashSync(form.data.password + salt, 12),
				salt: salt,
				salted: true,
			},
		});

		sendVerificationEmail(user);

		return redirect(303, "/login");
	},
};
