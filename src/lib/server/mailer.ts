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
import email_base from "$lib/assets/email/base.html?raw";
import email_notification from "$lib/assets/email/notification.html?raw";
import email_code from "$lib/assets/email/code.html?raw";
import email_security from "$lib/assets/email/security.html?raw";
import { DateTime } from "luxon";

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

function buildBase({
	title,
	preheader,
	content,
	footerText,
}: {
	title: string;
	preheader: string;
	content: string;
	footerText: string;
}): string {
	let file = email_base;

	file = file.replaceAll("{{content}}", content);

	file = file.replaceAll("{{title}}", title);
	file = file.replaceAll("{{preheader}}", preheader);
	file = file.replaceAll("{{homeUrl}}", ORIGIN);
	file = file.replaceAll("{{logoUrl}}", logo);
	file = file.replaceAll("{{sender}}", "Foxy.town");
	file = file.replaceAll("{{footerText}}", footerText);

	return file;
}

function buildNotification({
	title,
	preheader,
	username,
	body,
	url,
	buttonText,
	footerText,
	body2,
}: {
	title: string;
	preheader: string;
	username: string;
	body: string;
	url: string;
	buttonText: string;
	body2: string;
	footerText: string;
}): string {
	let file = buildBase({
		title,
		preheader,
		content: email_notification,
		footerText,
	});

	file = file.replaceAll("{{username}}", username);
	file = file.replaceAll("{{body}}", body);
	file = file.replaceAll("{{url}}", url);
	file = file.replaceAll("{{buttonText}}", buttonText);
	file = file.replaceAll("{{body2}}", body2);

	return file;
}

function buildCode({
	title,
	preheader,
	username,
	body,
	url,
	buttonText,
	body2,
	code,
	footerText,
}: {
	title: string;
	preheader: string;
	username: string;
	body: string;
	url: string;
	buttonText: string;
	body2: string;
	code: string;
	footerText: string;
}): string {
	let file = buildBase({
		title,
		preheader,
		content: email_code,
		footerText,
	});

	file = file.replaceAll("{{username}}", username);
	file = file.replaceAll("{{body}}", body);
	file = file.replaceAll("{{code}}", code);
	file = file.replaceAll("{{url}}", url);
	file = file.replaceAll("{{buttonText}}", buttonText);
	file = file.replaceAll("{{body2}}", body2);

	return file;
}
function buildSecurity({
	title,
	preheader,
	username,
	body,
	heading,
	changeTime,
	device,
	ipAddress,
	location,
	footerText,
}: {
	title: string;
	preheader: string;
	username: string;
	body: string;
	heading: string;
	changeTime: string;
	device: string;
	ipAddress: string;
	location: string;
	footerText: string;
}): string {
	let file = buildBase({
		title,
		preheader,
		content: email_security,
		footerText,
	});

	file = file.replaceAll("{{heading}}", heading);
	file = file.replaceAll("{{username}}", username);
	file = file.replaceAll("{{body}}", body);
	file = file.replaceAll("{{changeTime}}", changeTime);
	file = file.replaceAll("{{device}}", device);
	file = file.replaceAll("{{ipAddress}}", ipAddress);
	file = file.replaceAll("{{location}}", location);

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
		subject: `Завершите регистрацию для аккаунта ${username}`,
		html: buildNotification({
			title: "Подтверждение регистрации",
			preheader: "Остался один шаг — подтвердите вашу почту.",
			username,
			body: "Чтобы завершить регистрацию, необходимо подтвердить почту. Для продолжения нажмите кнопку ниже.",
			url,
			buttonText: "Подтвердить почту",
			body2: "Если вы не создавали аккаунт на foxy.town, то проигнорируйте это сообщение. Не подтверждённые аккаунты удаляются через 24 часа.",
			footerText: `Вы получили это письмо для аккаунта ${username}.`,
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
		subject: `Восстановление пароля`,
		html: buildNotification({
			title: "Восстановление пароля",
			preheader: `Привет, ${username}. Перейдите по ссылке, чтобы сменить пароль.`,
			username,
			url,
			body: "Вы запросили смену пароля. Для продолжения нажмите кнопку ниже.",
			buttonText: "Сменить пароль",
			body2: "Если вы не запрашивали смену пароля, то проигнорируйте это сообщение. Запрос активен только в течение 15 минут.",
			footerText: `Вы получили это письмо для аккаунта ${username}.`,
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
		subject: `Смена почты`,
		html: buildCode({
			title: "Смена почты",
			preheader: `Привет, ${username}. Введите код ниже, чтобы подтвердить новыую почту.`,
			username,
			url,
			body: "Вы запросили смену почты. Введите полученный код на странице изменения почты или перейдите по ссылке.",
			buttonText: "Сменить почту",
			body2: "Если вы не запрашивали смену почты, то проигнорируйте это сообщение. Запрос активен только в течение 15 минут.",
			code,
			footerText: `Вы получили это письмо для аккаунта ${username}.`,
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

export async function sendPassordChangedEmail({
	email,
	username,
	device,
	ipAddress,
	location,
}: {
	email: string;
	username: string;
	device: string;
	ipAddress: string;
	location: string;
}) {
	const info = await transporter.sendMail({
		from: '"Foxy.town" <auth@foxy.town>',
		to: email,
		subject: `Пароль изменён`,
		priority: "high",
		html: buildSecurity({
			title: "Пароль изменён",
			preheader: `Привет, ${username}. Ваш пароль был успешно изменён.`,
			username,
			body: "Пароль от вашего аккаунта был изменён. Если это были вы — всё в порядке, никаких действий не требуется.",
			heading: "Пароль был успешно изменён",
			changeTime: DateTime.now()
				.setLocale("ru")
				.toFormat("d MMMM yyyy в HH:mm"),
			device: device,
			ipAddress: ipAddress,
			location: location, // из GeoIP
			footerText: `Это автоматическое уведомление безопасности для аккаунта ${username}.`,
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

export async function sendEmailChangedEmail({
	email,
	username,
	device,
	ipAddress,
	location,
}: {
	email: string;
	username: string;
	device: string;
	ipAddress: string;
	location: string;
}) {
	const info = await transporter.sendMail({
		from: '"Foxy.town" <auth@foxy.town>',
		to: email,
		subject: `Почта изменена`,
		priority: "high",
		html: buildSecurity({
			title: "Почта изменена",
			preheader: `Привет, ${username}. На вашем аккаунте была изменена привязанная почта.`,
			username,
			body: 'На вашем аккаунте была изменена привязанная почта. Новая почта: <span style="color: #fc7155; font-weight: bold;">${newEmail}</span>. Если это были вы — никаких действий не требуется.',
			heading: "Почта была успешно изменена",
			changeTime: DateTime.now()
				.setLocale("ru")
				.toFormat("d MMMM yyyy в HH:mm"),
			device: device,
			ipAddress: ipAddress,
			location: location,
			footerText: `Это автоматическое уведомление безопасности для аккаунта ${username}.`,
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
