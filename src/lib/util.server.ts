import db from "./db";
import { DateTime } from "luxon";
import crypto from "crypto";
import fs from "fs";
import sharp from "sharp";

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
