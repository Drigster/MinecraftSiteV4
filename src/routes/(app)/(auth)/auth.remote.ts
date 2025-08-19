import { form, getRequestEvent } from "$app/server";
import { db } from "$lib/db";
import { redirect, type RemoteForm } from "@sveltejs/kit";
import z from "zod";
import bcrypt from "bcrypt";
import { createLuciaSession, sendVerificationEmail } from "$lib/util.server";
import { lucia } from "$lib/server/auth";
import { validate } from "deep-email-validator";
import { dev } from "$app/environment";
import { setFlash } from "sveltekit-flash-message/server";
import { v4 as uuidv4 } from "uuid";
import { generateIdFromEntropySize } from "lucia";

const loginSchema = z.object({
	login: z.string().min(1, "Никнейм не может быть пустым"),
	password: z.string().min(1, "Пароль не может быть пустым"),
});

const registerSchema = z.object({
	username: z
		.string()
		.min(1, "Никнейм не может быть пустым")
		.max(16, "Никнейм не может быть длинее 16 символов")
		.regex(/[a-zA-Z0-9_]+/, "Никнейм имеет недопустимые символы"),
	email: z.email(),
	password: z.string().min(1, "Пароль не может быть пустым"),
	password2: z.string().min(1, "Пароль не может быть пустым"),
});

export const logout = form(async () => {
	const { locals, cookies } = getRequestEvent();

	if (locals.session != null) {
		lucia.invalidateSession(locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: "/",
			...sessionCookie.attributes,
		});

		locals.session = null;
		locals.user = null;
	}

	return redirect(303, "/");
});

export const login: RemoteForm<{
	success: boolean;
	error: {
		login?: string[] | undefined;
		password?: string[] | undefined;
	};
}> = form(async (data) => {
	const { locals, cookies, request, url } = getRequestEvent();

	if (locals.user != null) {
		return redirect(303, "/profile");
	}

	const result = loginSchema.safeParse(Object.fromEntries(data.entries()));
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

	if (user == null) {
		return {
			success: false,
			error: {
				login: ["Пользователь не найден!"],
			},
		};
	}

	if (user.salted) {
		if (
			!bcrypt.compareSync(result.data.password + user.salt, user.password)
		) {
			return {
				success: false,
				error: {
					password: ["Пароль не верен!"],
				},
			};
		}
	} else if (!bcrypt.compareSync(result.data.password, user.password)) {
		return {
			success: false,
			error: {
				password: ["Пароль не верен!"],
			},
		};
	}

	if (!user.salted) {
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
});

export const register: RemoteForm<{
	success: boolean;
	error: {
		username?: string[] | undefined;
		email?: string[] | undefined;
		password?: string[] | undefined;
		password2?: string[] | undefined;
	};
}> = form(async (data) => {
	const { cookies } = getRequestEvent();

	const result = registerSchema.safeParse(Object.fromEntries(data.entries()));
	if (!result.success) {
		return {
			success: false,
			error: z.flattenError(result.error).fieldErrors,
		};
	}

	const existing_user = await db
		.selectFrom("User")
		.select(["email", "username"])
		.where((eb) =>
			eb.or([
				eb("username", "=", result.data.username),
				eb("email", "=", result.data.email),
			]),
		)
		.executeTakeFirst();

	if (existing_user != null) {
		if (existing_user.username == result.data.username) {
			return {
				success: false,
				error: {
					username: ["Никнейм занят!"],
				},
			};
		} else if (existing_user.email == result.data.email) {
			return {
				success: false,
				error: {
					email: ["Почта занята!"],
				},
			};
		}
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

	if (result.data.password != result.data.password2) {
		return {
			success: false,
			error: {
				password2: ["Пароли не совпадают!"],
			},
		};
	}

	const uuid = uuidv4();
	const salt = uuid.replaceAll("-", "");
	const user = await db
		.insertInto("User")
		.values({
			id: generateIdFromEntropySize(10),
			uuid: uuid,
			email: result.data.email,
			username: result.data.username,
			password: bcrypt.hashSync(result.data.password + salt, 12),
			salt: salt,
			salted: true,
		})
		.returningAll()
		.executeTakeFirstOrThrow();

	sendVerificationEmail(user);

	setFlash(
		{
			type: "info",
			message: "На почту было отправлено сообщение с верификацией!",
		},
		cookies,
	);

	return redirect(303, "/login");
});
