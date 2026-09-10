import {
	JWT_SECRET,
	ORIGIN,
	SMTP_HOST,
	SMTP_PASSWORD,
	SMTP_PORT,
	SMTP_USER,
} from "$env/static/private";
import logo from "$lib/assets/logo.svg";
import nodemailer, { type Transporter } from "nodemailer";
import { dev } from "$app/environment";
import * as jose from "jose";
import email_base from "$lib/assets/emailBase.html?raw";

let transporter: Transporter;
try {
	if (dev) {
		const testAccount = await nodemailer.createTestAccount();
		transporter = nodemailer.createTransport({
			host: "smtp.ethereal.email",
			port: 587,
			secure: false,
			auth: {
				user: testAccount.user,
				pass: testAccount.pass,
			},
		});
	} else {
		transporter = nodemailer.createTransport({
			host: SMTP_HOST,
			port: parseInt(SMTP_PORT),
			secure: false,
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASSWORD,
			},
			tls: {
				ciphers: "SSLv3",
			},
		});
	}
	try {
		await transporter.verify();
		console.log("Server is ready to take our messages");
	} catch (err) {
		console.error("Verification failed:", err);
	}
	console.log("INFO", "Transport ready");
} catch (error) {
	console.log("ERROR", error);
}

function buildEmail({
	title,
	username,
	url,
	body,
	buttonText,
	body2,
	body3,
}: {
	title: string;
	username: string;
	url: string;
	body: string;
	buttonText: string;
	body2: string;
	body3?: string;
}): string {
	let file = email_base;
	file = file.replaceAll("{{sender}}", "Foxy.town");
	file = file.replaceAll("{{homeUrl}}", ORIGIN);
	file = file.replaceAll("{{logoUrl}}", logo);
	file = file.replaceAll("{{title}}", title);
	file = file.replaceAll("{{username}}", username);
	file = file.replaceAll("{{url}}", url);
	file = file.replaceAll("{{body}}", body);
	file = file.replaceAll("{{buttonText}}", buttonText);
	file = file.replaceAll("{{body2}}", body2);
	file = file.replaceAll("{{body3}}", body3 ? body : "");
	return file;
}

async function generate_jwt({
	payload,
	issuer,
	audience,
}: {
	payload: jose.JWTPayload;
	issuer: string;
	audience: string;
}) {
	return await new jose.SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setIssuer(issuer)
		.setAudience(audience)
		.setExpirationTime("15m")
		.sign(new TextEncoder().encode(JWT_SECRET));
}

export async function sendVerificationEmail({
	email,
	username,
}: {
	email: string;
	username: string;
}) {
	const jwt = await generate_jwt({
		payload: { email },
		issuer: "register",
		audience: "register.verify",
	});
	const url = ORIGIN + "/register/verify/" + jwt;

	const info = await transporter.sendMail({
		from: '"Foxy.town" <auth@foxy.town>',
		to: email,
		subject: "Подтвердить регистрацию!",
		html: buildEmail({
			title: "Подтверждение регистрации",
			username,
			url,
			body: "Для завершения регистарции необходимо подвердить почту.",
			buttonText: "Подтвердить почту",
			body2: "Если вы не создавали аккаунт на foxy.town, то проигнорируйте это сообщение. Не подтверждённые аккаунты удаляются через 24 часа.",
		}),
		headers: {
			"X-Entity-Ref-ID": Math.random().toString().substring(2),
		},
	});

	if (dev) {
		console.log(
			"DEBUG",
			"Preview URL: " + nodemailer.getTestMessageUrl(info),
		);
	}

	if (info.rejected && info.rejected.length > 0) {
		return false;
	}

	return true;
}

export async function sendChangePasswordEmail({
	email,
	username,
}: {
	email: string;
	username: string;
}) {
	const jwt = await generate_jwt({
		payload: { email },
		issuer: "recover.password",
		audience: "recover.password",
	});
	const url = ORIGIN + "/forgotPassword/" + jwt;

	const info = await transporter.sendMail({
		from: '"Foxy.town" <auth@foxy.town>',
		to: email,
		subject: "Смена пароля!",
		html: buildEmail({
			title: "Смена пароля",
			username,
			url,
			body: "Нами был получен запрос на смену пароля. Для продолжения нажмите кнопку ниже.",
			buttonText: "Сменить пароль",
			body2: "Если вы не запрашивали смену пароля, то проигнорируйте это сообщение. Запрос активен только в течение 15 минут.",
		}),
		headers: {
			"X-Entity-Ref-ID": Math.random().toString().substring(2),
		},
	});

	if (dev) {
		console.log(
			"DEBUG",
			"Preview URL: " + nodemailer.getTestMessageUrl(info),
		);
	}

	if (info.rejected && info.rejected.length > 0) {
		return false;
	}

	return true;
}

export async function sendChangeEmailEmail({
	email,
	username,
	code,
}: {
	email: string;
	username: string;
	code: string;
}) {
	const url = ORIGIN + "/profile/editEmail/verify";

	const info = await transporter.sendMail({
		from: '"Foxy.town" <auth@foxy.town>',
		to: email,
		subject: "Смена почты!",
		html: buildEmail({
			title: "Смена почты",
			username,
			url,
			body: `Нами был получен запрос на смену почты. Для продолжения введите полученый код на странице изменения почты или по ссылке.`,
			buttonText: "Сменить почту",
			body2: "Если вы не запрашивали смену почты, срочно обратитесь к администрации. Запрос активен только в течение 10 минут.",
			body3: `<table cellpadding="0" cellspacing="0" role="presentation" width="100%" style="width: 100%; margin: 24px 0;"><tr><td align="center" bgcolor="#000000" class="sm-code code-text" style="background-color: #000000; border: 1px dashed #fc7155; border-radius: 6px; padding: 18px 24px; text-align: center; font-size: 32px; line-height: 38px; font-weight: 700; color: #fc7155; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;"><span style="font-size: inherit; line-height: inherit; font-weight: 700; color: #fc7155; font-family: inherit; letter-spacing: 0; user-select: all; -webkit-user-select: all; -moz-user-select: all; display: inline-block;">${code}</span></td></tr></table>`,
		}),
		headers: {
			"X-Entity-Ref-ID": Math.random().toString().substring(2),
		},
	});

	if (dev) {
		console.log(
			"DEBUG",
			"Preview URL: " + nodemailer.getTestMessageUrl(info),
		);
	}

	if (info.rejected && info.rejected.length > 0) {
		return false;
	}

	return true;
}
