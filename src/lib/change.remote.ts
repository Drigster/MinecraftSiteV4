import { form, getRequestEvent } from "$app/server";
import { invalid, redirect } from "@sveltejs/kit";
import bcrypt from "bcryptjs";
import { dev } from "$app/environment";
import {
	changeEmailSchema,
	changePasswordSchema,
	changeUsernameSchema,
	confirmEmailChangeSchema,
	forgotPasswordSchema,
	recoverPasswordSchema,
} from "$lib/schemas";
import {
	sendChangeEmailEmail,
	sendChangePasswordEmail,
	sendEmailChangedEmail,
	sendPassordChangedEmail,
	sendVerificationEmail,
} from "$lib/server/mailer";
import { verifyEmailDetailed } from "@devmehq/email-validator-js";
import { nanoid } from "nanoid";
import { generateOneTimeCode, getDevice, getLocation } from "./server/auth";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { resolve } from "$app/paths";
import * as jose from "jose";
import { JWT_SECRET } from "$env/static/private";

export const sendForgotPassword = form(forgotPasswordSchema, async (data) => {
	const { locals } = getRequestEvent();

	const user = await locals.db
		.selectFrom("User")
		.select(["email", "username"])
		.where((eb) =>
			eb.or([
				eb("username", "=", data.login),
				eb("email", "=", data.login),
			]),
		)
		.executeTakeFirst();

	if (user != undefined) {
		if (
			(await sendChangePasswordEmail({
				email: user.email,
				username: user.username,
			})) == false
		) {
			return {
				message: "Ошибка при отправке сообщения попробуйте позже",
			};
		}
	}
	return {
		message:
			"Если пользователь существует на почту было отправлено сообщение с восстановлением пароля",
	};
});

export const changePassword = form(changePasswordSchema, async (data) => {
	const { locals, request, getClientAddress } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	}

	const user = await locals.db
		.selectFrom("User")
		.select(["password", "email", "username"])
		.where("id", "=", locals.user.id)
		.executeTakeFirstOrThrow();

	if (!(await bcrypt.compare(data._current_password, user.password))) {
		invalid({
			path: ["_current_password"],
			message: "Пароль не верен!",
		});
	}

	await locals.db
		.updateTable("User")
		.where("id", "=", locals.user.id)
		.set({
			password: bcrypt.hashSync(data._password, 12),
		})
		.execute();

	await locals.db
		.deleteFrom("Session")
		.where("user_id", "=", locals.user.id)
		.execute();

	const device = getDevice(request.headers.get("User-Agent") || null);

	let ip = getClientAddress();

	if (ip.startsWith("::ffff:")) {
		ip = ip.slice(7);
	}

	const location = getLocation(ip);

	sendPassordChangedEmail({
		email: user.email,
		username: user.username,
		device: device || "Неизвестно",
		ipAddress: ip,
		location: location || "Неизвестно",
	});

	redirect(303, resolve("/login"));
});

export const recoverPassword = form(recoverPasswordSchema, async (data) => {
	const { locals, request, getClientAddress } = getRequestEvent();

	let payload: jose.JWTPayload | undefined;
	try {
		payload = (
			await jose.jwtVerify(
				data.token,
				new TextEncoder().encode(JWT_SECRET),
				{
					issuer: "recover.password",
					audience: "recover.password",
				},
			)
		).payload;
	} catch (err) {
		console.log(err);
		return { message: "Время запроса истекло!" };
	}

	const user = await locals.db
		.selectFrom("User")
		.select(["id", "email", "username"])
		.where("email", "=", payload.email as string)
		.executeTakeFirst();

	if (user == undefined) {
		return { message: "Время запроса истекло!" };
	}

	await locals.db
		.updateTable("User")
		.where("id", "=", user.id)
		.set({
			password: bcrypt.hashSync(data._password, 12),
		})
		.execute();

	await locals.db
		.deleteFrom("Session")
		.where("user_id", "=", user.id)
		.execute();

	const device = getDevice(request.headers.get("User-Agent") || null);

	let ip = getClientAddress();

	if (ip.startsWith("::ffff:")) {
		ip = ip.slice(7);
	}

	const location = getLocation(ip);

	sendPassordChangedEmail({
		email: user.email,
		username: user.username,
		device: device || "Неизвестно",
		ipAddress: ip,
		location: location || "Неизвестно",
	});

	redirect(303, resolve("/login"));
});

export const changeEmail = form(changeEmailSchema, async (data) => {
	const { locals } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	}

	const user = await locals.db
		.selectFrom("User")
		.select("email")
		.where("id", "=", locals.user.id)
		.executeTakeFirstOrThrow();

	if (user.email == data.email) {
		invalid({
			path: ["email"],
			message: "Новая почта не может совпадать со старой",
		});
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

	const code = generateOneTimeCode();
	const hash = encodeHexLowerCase(sha256(new TextEncoder().encode(code)));
	const expires_at = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

	const id: `cef_${string}` = `cef_${nanoid()}`;
	await locals.db
		.insertInto("ChangeEmailRequest")
		.values({
			id,
			new_email: data.email,
			code_hash: hash,
			expires_at: Math.floor(expires_at.getTime() / 1000),
			user_id: locals.user.id,
		})
		.onConflict((oc) =>
			oc.column("user_id").doUpdateSet({
				new_email: data.email,
				code_hash: hash,
				expires_at: Math.floor(expires_at.getTime() / 1000),
			}),
		)
		.execute();

	sendChangeEmailEmail({
		email: data.email,
		username: locals.user.username,
		code,
	});

	redirect(303, resolve("/profile/editEmail/verify"));
});

export const confirmEmailChange = form(
	confirmEmailChangeSchema,
	async (data) => {
		const { locals, getClientAddress, request: req } = getRequestEvent();

		if (locals.user == null) {
			redirect(303, "/login");
		}

		const request = await locals.db
			.selectFrom("ChangeEmailRequest")
			.select(["expires_at", "code_hash", "new_email"])
			.where("user_id", "=", locals.user.id)
			.executeTakeFirst();

		if (request == undefined) {
			return { message: "Запрос истёк или не существует!" };
		}

		const expires_at = new Date(request.expires_at * 1000);

		if (Date.now() >= expires_at.getTime()) {
			await locals.db
				.deleteFrom("ChangeEmailRequest")
				.where("user_id", "=", locals.user.id)
				.execute();
			return { message: "Запрос истёк или не существует!" };
		}

		const hash = encodeHexLowerCase(
			sha256(new TextEncoder().encode(data.code)),
		);

		if (hash != request.code_hash) {
			invalid({
				path: ["code"],
				message: "Код не совпадает!",
			});
		}

		const user = await locals.db
			.selectFrom("User")
			.select(["email", "username"])
			.where("id", "=", locals.user.id)
			.executeTakeFirstOrThrow();

		await locals.db
			.deleteFrom("ChangeEmailRequest")
			.where("user_id", "=", locals.user.id)
			.execute();
		await locals.db
			.updateTable("User")
			.where("id", "=", locals.user.id)
			.set({
				email: request.new_email,
			})
			.execute();

		const device = getDevice(req.headers.get("User-Agent") || null);

		let ip = getClientAddress();

		if (ip.startsWith("::ffff:")) {
			ip = ip.slice(7);
		}

		const location = getLocation(ip);

		sendEmailChangedEmail({
			email: user.email,
			username: user.username,
			device: device || "Неизвестно",
			ipAddress: ip,
			location: location || "Неизвестно",
		});

		redirect(303, resolve("/profile"));
	},
);

export const changeUsername = form(changeUsernameSchema, async (data) => {
	const { locals } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	}

	const existing = await locals.db
		.selectFrom("User")
		.select("id")
		.where("username", "=", data.username)
		.executeTakeFirst();

	if (existing != undefined) {
		invalid({
			path: ["username"],
			message: "Никнейм занят!",
		});
	}

	await locals.db
		.updateTable("User")
		.where("id", "=", locals.user.id)
		.set({
			username: data.username,
		})
		.execute();

	redirect(303, resolve("/profile"));
});

export const resendEmailVerify = form(async () => {
	const { locals } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	}

	const user = await locals.db
		.selectFrom("User")
		.select(["username", "email"])
		.where("id", "=", locals.user.id)
		.executeTakeFirstOrThrow();

	if (await sendVerificationEmail(user)) {
		return {
			message: "Новое сообщение с верицикацией успешно отправлено.",
		};
	} else {
		return {
			message:
				"Не удалось отправить сообщение на почту. Попробуйте позже.",
		};
	}
});
