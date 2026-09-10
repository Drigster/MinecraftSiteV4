import { form, getRequestEvent } from "$app/server";
import { invalid, redirect } from "@sveltejs/kit";
import bcrypt from "bcryptjs";
import { dev } from "$app/environment";
import { verifyEmailDetailed } from "@devmehq/email-validator-js";
import { v4 as uuidv4 } from "uuid";
import { resolve } from "$app/paths";
import {
	create_session,
	generate_session_token,
	invalidate_session,
} from "./server/auth";
import { nanoid } from "nanoid";
import { sendVerificationEmail } from "./server/mailer";
import { loginSchema, registerSchema } from "./schemas";

export const login = form(loginSchema, async (data) => {
	const { locals, cookies, request, getClientAddress, url } =
		getRequestEvent();

	if (locals.user != null) {
		return redirect(303, "/profile");
	}

	const user = await locals.db
		.selectFrom("User")
		.select(["id", "password"])
		.where((eb) =>
			eb.or([
				eb("username", "=", data.login),
				eb("email", "=", data.login),
			]),
		)
		.executeTakeFirst();

	if (user == null) {
		invalid({
			path: ["login"],
			message: "Пользователь не найден!",
		});
	}

	if ((await bcrypt.compare(data._password, user.password)) == false) {
		invalid({
			path: ["_password"],
			message: "Пароль не верен!",
		});
	}

	const token = generate_session_token();
	const session = await create_session(token, user.id, {
		ip: getClientAddress(),
		user_agent: request.headers.get("User-Agent") || null,
	});

	cookies.set("session", token, {
		path: "/",
		httpOnly: true,
		expires: session.expires_at,
		secure: !dev,
	});

	const redirectTo = url.searchParams.get("r");
	if (redirectTo != null) {
		return redirect(303, redirectTo);
	}
	return redirect(303, "/profile");
});

export const register = form(registerSchema, async (data) => {
	const { locals } = getRequestEvent();

	const existing_user = await locals.db
		.selectFrom("User")
		.select(["email", "username"])
		.where((eb) =>
			eb.or([
				eb("username", "=", data.username),
				eb("email", "=", data.email),
			]),
		)
		.executeTakeFirst();

	if (existing_user) {
		if (existing_user.username == data.username) {
			invalid({ path: ["username"], message: "Никнейм занят!" });
		} else if (existing_user.email == data.email) {
			invalid({ path: ["email"], message: "Почта занята!" });
		}
	}

	if (!dev) {
		const result = await verifyEmailDetailed({
			emailAddress: data.email,
			verifyMx: true,
			verifySmtp: true,
			timeout: 3000,
			suggestDomain: false,
			checkFree: false,
		});
		if (result.valid != true) {
			if (result.disposable) {
				invalid({
					path: ["email"],
					message: "Внутреняя ошибка, попробуйте позже",
				});
			} else if (result.domain.valid == false) {
				invalid({
					path: ["email"],
					message: "Ошибка сервера, попробуйте позже",
				});
			} else if (result.smtp.valid == false) {
				invalid({
					path: ["email"],
					message: "Ошибка сервера, попробуйте позже!",
				});
			} else {
				invalid({
					path: ["email"],
					message: "Неизвестная ошибка, попробуйте позже",
				});
			}
		}
	}

	if (data._password != data._password2) {
		invalid({ path: ["password2"], message: "Пароли не совпадают!" });
	}

	const id: `u_${string}` = `u_${nanoid()}`;
	const uuid = uuidv4();
	const password_hash = await bcrypt.hash(data._password, 12);

	const user = await locals.db
		.insertInto("User")
		.values({
			id,
			uuid,
			email: data.email,
			username: data.username,
			password: password_hash,
			regDate: new Date().toISOString(),
		})
		.returningAll()
		.executeTakeFirstOrThrow();

	sendVerificationEmail(user);

	// TODO
	// setFlash(
	//     {
	//         type: "info",
	//         message: "На почту было отправлено сообщение с верификацией!",
	//     },
	//     cookies,
	// );

	return redirect(303, "/login");
});

export const logout = form(async () => {
	const { cookies, locals } = getRequestEvent();
	if (!locals.session) {
		redirect(303, resolve("/"));
	}

	await invalidate_session(locals.session.id);
	cookies.delete("session", { path: "/" });

	redirect(303, resolve("/"));
});
