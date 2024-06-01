import db from "./db";
import { DateTime } from "luxon";
import crypto from "crypto";
import fs from "fs";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import {
	JWT_SECRET,
	NODE_ENV,
	ORIGIN,
	SMTP_HOST,
	SMTP_PASSWORD,
	SMTP_PORT,
	SMTP_USER,
	SMTP_SECURE
} from "$env/static/private";
import logo from "$lib/assets/logo.svg";
import type { User } from "@prisma/client";
import nodemailer from "nodemailer";
import type { SentMessageInfo } from "nodemailer/lib/smtp-transport";

let transporter: nodemailer.Transporter<SentMessageInfo>;
try {
	if (NODE_ENV === "development") {
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
			port: SMTP_PORT,
			secure: SMTP_SECURE,
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASSWORD,
			},
		});
	}
	console.log("INFO", "Transport ready");
} catch (error) {
	console.log("ERROR", error);
}

export async function getUser(token: string | undefined) {
	if (token != undefined) {
		const session = await db.session.findUnique({
			where: {
				token,
			},
			include: {
				user: {
					include: {
						sessions: true,
						donations: true,
					},
				},
			},
		});

		if (session != undefined && session.expiresAt >= DateTime.now().toJSDate()) {
			return session.user;
		}
	}

	return null;
}

export function generateToken(length = 32) {
	return crypto.randomBytes(length).toString("hex");
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

	const body = await sharp("./files/template.png")
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

export function verifyToken(token: string) {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch {
		return false;
	}
}

export async function sendVerificationEmail(user: User) {
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

	if (process.env.NODE_ENV === "development") {
		console.log("DEBUG", "Preview URL: " + nodemailer.getTestMessageUrl(info));
	}
}

export async function sendChangePasswordEmail(user: User) {
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

	if (process.env.NODE_ENV === "development") {
		console.log("DEBUG", "Preview URL: " + nodemailer.getTestMessageUrl(info));
	}
}

export async function sendChangeEmailEmail(user: User) {
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

	if (process.env.NODE_ENV === "development") {
		console.log("DEBUG", "Preview URL: " + nodemailer.getTestMessageUrl(info));
	}
}
