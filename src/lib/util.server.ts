import fs from "fs";
import sharp from "sharp";
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
import type { DB, Session, User } from "./db/schema";
import type { Selectable } from "kysely";
import { dev } from "$app/environment";
import type { LauncherUser, LauncherUserSession } from "./types.ts";
import { DateTime, Interval } from "luxon";
import { generateIdFromEntropySize } from "lucia";
import { lucia } from "./server/auth";
import DeviceDetector from "device-detector-js";
import geoip from "geoip-lite";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import skinTemplate from "$lib/assets/template.png?hex";

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
	console.log("INFO", "Transport ready");
} catch (error) {
	console.log("ERROR", error);
}

export async function saveSkin(file: File, filename: string) {
	const fileBuffer = Buffer.from(await file.arrayBuffer());

	fs.writeFileSync("./files/skins/" + filename + ".png", fileBuffer);

	await sharp(fileBuffer)
		.extract({
			left: 8,
			top: 8,
			width: 8,
			height: 8,
		})
		.resize(128, 128, {
			kernel: sharp.kernel.nearest,
		})
		.toFile("./files/skins/" + filename + "_head.png");

	const body = await sharp(Buffer.from(skinTemplate, "hex"))
		.resize(16, 32)
		.composite([
			{
				input: await sharp(fileBuffer)
					.extract({
						left: 8,
						top: 8,
						width: 8,
						height: 8,
					})
					.toBuffer(),
				top: 0,
				left: 4,
			},
			{
				input: await sharp(fileBuffer)
					.extract({
						left: 44,
						top: 20,
						width: 4,
						height: 12,
					})
					.toBuffer(),
				top: 8,
				left: 0,
			},
			{
				input: await sharp(fileBuffer)
					.extract({
						left: 36,
						top: 52,
						width: 4,
						height: 12,
					})
					.toBuffer(),
				top: 8,
				left: 12,
			},
			{
				input: await sharp(fileBuffer)
					.extract({
						left: 20,
						top: 20,
						width: 8,
						height: 12,
					})
					.toBuffer(),
				top: 8,
				left: 4,
			},
			{
				input: await sharp(fileBuffer)
					.extract({
						left: 4,
						top: 20,
						width: 4,
						height: 12,
					})
					.toBuffer(),
				top: 20,
				left: 4,
			},
			{
				input: await sharp(fileBuffer)
					.extract({
						left: 20,
						top: 52,
						width: 4,
						height: 12,
					})
					.toBuffer(),
				top: 20,
				left: 8,
			},
		])
		.toBuffer();

	await sharp(body)
		.resize(256, 512, {
			kernel: sharp.kernel.nearest,
		})
		.toFile("./files/skins/" + filename + "_body.png");
}

export function deleteSkin(filename: string) {
	fs.rmSync("./files/skins/" + filename + ".png", {
		force: true,
	});

	fs.rmSync("./files/skins/" + filename + "_head.png", {
		force: true,
	});

	fs.rmSync("./files/skins/" + filename + "_body.png", {
		force: true,
	});
}

export function deleteCape(filename: string) {
	fs.rmSync("./files/capes/" + filename + ".png", {
		force: true,
	});
}

function buildEmail(
	title: string,
	username: string,
	url: string,
	body: string,
	buttonText: string,
	body2: string,
): string {
	let file = fs.readFileSync("./src/lib/assets/emailBase.html").toString();
	file = file.replaceAll("{{sender}}", "Foxy.town");
	file = file.replaceAll("{{homeUrl}}", ORIGIN);
	file = file.replaceAll("{{logoUrl}}", logo);
	file = file.replaceAll("{{title}}", title);
	file = file.replaceAll("{{username}}", username);
	file = file.replaceAll("{{url}}", url);
	file = file.replaceAll("{{body}}", body);
	file = file.replaceAll("{{buttonText}}", buttonText);
	file = file.replaceAll("{{body2}}", body2);
	return file;
}

export async function sendVerificationEmail(user: Selectable<User>) {
	const token = jwt.sign({ email: user.email }, JWT_SECRET, {
		expiresIn: "15m",
	});
	const url = ORIGIN + "/register/verify/" + token;

	const info = await transporter.sendMail({
		from: '"Foxy.town" <auth@foxy.town>',
		to: user.email,
		subject: "Подтвердить регистрацию!",
		html: buildEmail(
			"Подтверждение регистрации",
			user.username,
			url,
			"Для завершения регистарции необходимо подвердить почту.",
			"Подтвердить почту",
			"Если вы не создавали аккаунт на foxy.town, то проигнорируйте это сообщение. Не подтверждённые аккаунты удаляются через 24 часа.",
		),
		headers: {
			"X-Entity-Ref-ID": Math.random().toString().substring(2),
		},
	});

	console.log(JSON.stringify(info));

	if (dev) {
		console.log(
			"DEBUG",
			"Preview URL: " + nodemailer.getTestMessageUrl(info),
		);
	}
}

export async function sendChangePasswordEmail(user: Selectable<User>) {
	const token = jwt.sign({ email: user.email }, JWT_SECRET, {
		expiresIn: "15m",
	});
	const url = ORIGIN + "/change/password/" + token;

	const info = await transporter.sendMail({
		from: '"Foxy.town" <auth@foxy.town>',
		to: user.email,
		subject: "Смена пароля!",
		html: buildEmail(
			"Смена пароля",
			user.username,
			url,
			"Нами был получен запрос на смену пароля. Для продолжения нажмите кнопку ниже.",
			"Сменить пароль",
			"Если вы не запрашивали смену пароля, то проигнорируйте это сообщение. Запрос активен только в течение 15 минут.",
		),
		headers: {
			"X-Entity-Ref-ID": Math.random().toString().substring(2),
		},
	});

	console.log(JSON.stringify(info));

	if (dev) {
		console.log(
			"DEBUG",
			"Preview URL: " + nodemailer.getTestMessageUrl(info),
		);
	}
}

export async function sendChangeEmailEmail(user: Selectable<User>) {
	const token = jwt.sign({ email: user.email }, JWT_SECRET, {
		expiresIn: "15m",
	});
	const url = ORIGIN + "/change/email/" + token;

	const info = await transporter.sendMail({
		from: '"Foxy.town" <auth@foxy.town>',
		to: user.email,
		subject: "Смена почты!",
		html: buildEmail(
			"Смена почты",
			user.username,
			url,
			"Нами был получен запрос на смену почты. Для продолжения нажмите кнопку ниже.",
			"Сменить почту",
			"Если вы не запрашивали смену почты, то проигнорируйте это сообщение. Запрос активен только в течение 15 минут.",
		),
		headers: {
			"X-Entity-Ref-ID": Math.random().toString().substring(2),
		},
	});

	console.log(JSON.stringify(info));

	if (dev) {
		console.log(
			"DEBUG",
			"Preview URL: " + nodemailer.getTestMessageUrl(info),
		);
	}
}

export function createLauncherUser(user: Selectable<User>) {
	const skinUrl = ORIGIN + "/api/skin/" + user.username;

	let skin;
	if (fs.existsSync("./files/skins/" + user.id.toString() + ".png")) {
		skin = fs.readFileSync("./files/skins/" + user.id.toString() + ".png");
	} else {
		skin = fs.readFileSync("./files/default.png");
	}

	const userData: LauncherUser = {
		username: user.username,
		uuid: user.uuid,
		// TODO: get from servers
		permissions: ["*"],
		roles: [user.role],
		assets: {
			SKIN: {
				url: skinUrl,
				digest: createHash("sha256").update(skin).digest("hex"),
			},
		},
	};

	return userData;
}

export function createLauncherUserSession(
	session: {
		id: Selectable<DB["Session"]>["id"];
		token: Selectable<DB["Session"]>["token"];
		refreshToken: Selectable<DB["Session"]>["refreshToken"];
		expires_at?: Selectable<DB["Session"]>["expires_at"];
		expiresAt?: Date;
	},
	user: Selectable<DB["User"]>,
) {
	const sessionData: LauncherUserSession = {
		id: session.id,
		accessToken: session.token,
		refreshToken: session.refreshToken,
		expire: Math.floor(
			Interval.fromDateTimes(
				DateTime.now(),
				session.expires_at
					? DateTime.fromSQL(session.expires_at)
					: DateTime.fromJSDate(session.expiresAt!),
			).length("seconds"),
		),
		user: createLauncherUser(user),
	};

	return sessionData;
}

export async function createLuciaSession(
	ip: string | null,
	userId: Selectable<User>["id"],
	userAgent: string,
	type: Selectable<Session>["type"],
) {
	let location = "Unknown";
	if (ip != null) {
		const geo = geoip.lookup(ip);
		if (geo != null) {
			location = `${geo?.country}, ${geo?.region}, ${geo?.city}`;
		}
	}
	const deviceDetector = new DeviceDetector();
	const device = deviceDetector.parse(userAgent);
	const session = await lucia.createSession(userId, {
		token: generateIdFromEntropySize(32),
		refreshToken: generateIdFromEntropySize(32),
		device: `${device.os?.name} ${device.os?.version} - ${device.client?.name} ${device.client?.version}`,
		location,
		type: type,
	});

	return session;
}
