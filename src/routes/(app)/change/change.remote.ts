import { form, getRequestEvent } from "$app/server";
import { db } from "$lib/db";
import { sendChangePasswordEmail } from "$lib/util.server";
import { redirect, type RemoteForm } from "@sveltejs/kit";
import { setFlash } from "sveltekit-flash-message/server";
import z from "zod";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "$env/static/private";
import bcrypt from "bcrypt";
import validate from "deep-email-validator";
import { dev } from "$app/environment";

const forgotPasswordSchema = z.object({
	login: z.string().min(1, "Логин не может быть пустым"),
});

const changePasswordSchema = z.object({
	token: z.string().min(1),
	password: z.string().min(1, "Пароль не может быть пустым"),
	password2: z.string().min(1, "Пароль2 не может быть пустым"),
});

const changeEmailSchema = z.object({
	token: z.string().min(1),
	email: z.email("Неверный формат почты"),
});

export const forgotPassword: RemoteForm<
	| {
			success: false;
			error: {
				login?: string[] | undefined;
			};
	  }
	| {
			success: true;
			message: string;
	  }
> = form(async (data) => {
	const { locals } = getRequestEvent();

	if (locals.user != null) {
		return redirect(303, "/profile");
	}

	const result = forgotPasswordSchema.safeParse(
		Object.fromEntries(data.entries()),
	);
	if (!result.success) {
		return {
			success: false,
			error: z.flattenError(result.error).fieldErrors,
		};
	}

	const user = await db
		.selectFrom("User")
		.selectAll()
		.where((eb) =>
			eb.or([
				eb("username", "=", result.data.login),
				eb("email", "=", result.data.login),
			]),
		)
		.executeTakeFirst();

	if (user != null) {
		if (await sendChangePasswordEmail(user)) {
			return {
				success: true,
				message:
					"На почту было отправлено сообщение с изменением пароля!",
			};
		} else {
			return {
				success: true,
				message: "Ошибка при отправке сообщения попробуйте позже",
			};
		}
	} else {
		return {
			success: false,
			error: {
				login: ["Пользователь не найден!"],
			},
		};
	}
});

export const changePassword: RemoteForm<{
	success: false;
	error: {
		token?: string[] | undefined;
		password?: string[] | undefined;
		password2?: string[] | undefined;
	};
}> = form(async (data) => {
	const { cookies } = getRequestEvent();

	const result = changePasswordSchema.safeParse(
		Object.fromEntries(data.entries()),
	);
	if (!result.success) {
		return {
			success: false,
			error: z.flattenError(result.error).fieldErrors,
		};
	}

	let token;
	try {
		token = jwt.verify(result.data.token, JWT_SECRET, {
			ignoreExpiration: true,
		}) as jwt.JwtPayload;
	} catch {
		return {
			success: false,
			error: {
				token: ["Время запроса истекло или токен недействителен!"],
			},
		};
	}

	const user = await db
		.selectFrom("User")
		.select(["id", "uuid"])
		.where("email", "=", token.email)
		.executeTakeFirst();

	if (user == null) {
		return {
			success: false,
			error: {
				token: ["Токен не действителен!"],
			},
		};
	}

	if (result.data.password != result.data.password2) {
		return {
			success: false,
			error: { password2: ["Пароли не совпадают!"] },
		};
	}

	await db
		.updateTable("User")
		.where("id", "=", user.id)
		.set({
			salted: true,
			salt: user.uuid.replaceAll("-", ""),
			password: bcrypt.hashSync(
				result.data.password + user.uuid.replaceAll("-", ""),
				12,
			),
		})
		.execute();

	await db.deleteFrom("Session").where("user_id", "=", user.id).execute();

	setFlash(
		{
			type: "success",
			message: "Пароль успешно изменён!",
		},
		cookies,
	);

	return redirect(303, "/");
});

export const changeEmail: RemoteForm<{
	success: false;
	error: {
		token?: string[] | undefined;
		email?: string[] | undefined;
	};
}> = form(async (data) => {
	const { cookies } = getRequestEvent();

	const result = changeEmailSchema.safeParse(
		Object.fromEntries(data.entries()),
	);
	if (!result.success) {
		return {
			success: false,
			error: z.flattenError(result.error).fieldErrors,
		};
	}

	let token;
	try {
		token = jwt.verify(result.data.token, JWT_SECRET, {
			ignoreExpiration: true,
		}) as jwt.JwtPayload;
	} catch {
		return {
			success: false,
			error: {
				token: ["Время запроса истекло или токен недействителен!"],
			},
		};
	}

	const user = await db
		.selectFrom("User")
		.select("id")
		.where("email", "=", token.email)
		.executeTakeFirst();

	if (user == null) {
		return {
			success: false,
			error: {
				token: ["Токен не действителен!"],
			},
		};
	}

	if (!dev) {
		const res = await validate(result.data.email);
		if (!res.valid) {
			switch (res.reason) {
				case "regex":
					return {
						success: false,
						error: {
							email: ["Неверный формат почты!"],
						},
					};
				case "disposable":
					return {
						success: false,
						error: {
							email: ["Временные почты запрещены!"],
						},
					};
				case "typo":
				case "mx":
				case "smtp":
					return {
						success: false,
						error: {
							email: [
								"Почта не существует или не действительна!",
							],
						},
					};
				default:
					break;
			}
		}
	}

	await db
		.updateTable("User")
		.where("id", "=", user.id)
		.set({
			email: result.data.email,
		})
		.execute();

	setFlash(
		{
			type: "success",
			message: "Почта успешно изменена!",
		},
		cookies,
	);

	return redirect(303, "/");
});
