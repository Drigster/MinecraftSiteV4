import fs from "fs";
import sharp from "sharp";
import skinTemplate from "$lib/assets/template.png?hex";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

export async function saveSkin(file: File) {
	const inputBuffer = Buffer.from(await file.arrayBuffer());

	const { data: fileBuffer, info } = await sharp(inputBuffer)
		.png()
		.toBuffer({ resolveWithObject: true });

	if (info.width !== 64 || info.height !== 64) {
		throw new Error("Image must be 64x64 pixels");
	}

	const isSlim = await isSlimSkin(fileBuffer);

	const digest = encodeHexLowerCase(sha256(fileBuffer));

	if (fs.existsSync("./files/skins/" + digest + ".png")) {
		return { digest, isSlim: isSlim };
	}

	if (!fs.existsSync("./files/skins/")) {
		fs.mkdirSync("./files/skins/", { recursive: true });
	}

	fs.writeFileSync("./files/skins/" + digest + ".png", fileBuffer);

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
		.composite([
			{
				// top layer - head
				input: await sharp(fileBuffer)
					.extract({
						left: 40,
						top: 8,
						width: 8,
						height: 8,
					})
					.resize(128, 128, {
						kernel: sharp.kernel.nearest,
					})
					.toBuffer(),
				top: 0,
				left: 0,
			},
		])
		.toFile("./files/skins/" + digest + "_head.png");

	const body = await sharp(Buffer.from(skinTemplate, "hex"))
		.resize(16, 32)
		.composite([
			{
				// head
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
				// left arm
				input: await sharp(fileBuffer)
					.extract({
						left: 44,
						top: 20,
						width: isSlim ? 3 : 4,
						height: 12,
					})
					.toBuffer(),
				top: 8,
				left: isSlim ? 1 : 0,
			},
			{
				// right arm
				input: await sharp(fileBuffer)
					.extract({
						left: 36,
						top: 52,
						width: isSlim ? 3 : 4,
						height: 12,
					})
					.toBuffer(),
				top: 8,
				left: 12,
			},
			{
				// torso
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
				// left leg
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
				// right leg
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
			{
				// top layer - head
				input: await sharp(fileBuffer)
					.extract({
						left: 40,
						top: 8,
						width: 8,
						height: 8,
					})
					.toBuffer(),
				top: 0,
				left: 4,
			},
			{
				// top layer - left arm
				input: await sharp(fileBuffer)
					.extract({
						left: 44,
						top: 36,
						width: isSlim ? 3 : 4,
						height: 12,
					})
					.toBuffer(),
				top: 8,
				left: isSlim ? 1 : 0,
			},
			{
				// top layer - right arm
				input: await sharp(fileBuffer)
					.extract({
						left: 52,
						top: 52,
						width: isSlim ? 3 : 4,
						height: 12,
					})
					.toBuffer(),
				top: 8,
				left: 12,
			},
			{
				// top layer - torso
				input: await sharp(fileBuffer)
					.extract({
						left: 20,
						top: 36,
						width: 8,
						height: 12,
					})
					.toBuffer(),
				top: 8,
				left: 4,
			},
			{
				// top layer - left leg
				input: await sharp(fileBuffer)
					.extract({
						left: 4,
						top: 36,
						width: 4,
						height: 12,
					})
					.toBuffer(),
				top: 20,
				left: 4,
			},
			{
				// top layer - right leg
				input: await sharp(fileBuffer)
					.extract({
						left: 4,
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
		.toFile("./files/skins/" + digest + "_body.png");

	return { digest, isSlim: isSlim };
}

export function deleteSkin(digest: string) {
	fs.rmSync("./files/skins/" + digest + ".png", {
		force: true,
	});

	fs.rmSync("./files/skins/" + digest + "_head.png", {
		force: true,
	});

	fs.rmSync("./files/skins/" + digest + "_body.png", {
		force: true,
	});
}

export async function saveCape(file: File) {
	const inputBuffer = Buffer.from(await file.arrayBuffer());

	const { data: fileBuffer, info } = await sharp(inputBuffer)
		.png()
		.toBuffer({ resolveWithObject: true });

	if (info.width !== 64 || info.height !== 32) {
		throw new Error("Image must be 64x32 pixels");
	}

	const digest = encodeHexLowerCase(sha256(fileBuffer));

	if (fs.existsSync("./files/capes/" + digest + ".png")) {
		return digest;
	}

	if (!fs.existsSync("./files/capes/")) {
		fs.mkdirSync("./files/capes/", { recursive: true });
	}
	fs.writeFileSync("./files/capes/" + digest + ".png", fileBuffer);

	return digest;
}

export function deleteCape(filename: string) {
	fs.rmSync("./files/capes/" + filename + ".png", {
		force: true,
	});
}

async function isSlimSkin(buffer: Buffer): Promise<boolean> {
	const { data, info } = await sharp(buffer)
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	const channels = info.channels; // 4 (RGBA)

	// Check right arm unused column (x=54, y=20..31)
	for (let y = 20; y <= 31; y++) {
		const i = (y * info.width + 54) * channels;
		if (data[i + 3] !== 0) return false;
	}

	// Check left arm unused column (x=46, y=52..63)
	for (let y = 52; y <= 63; y++) {
		const i = (y * info.width + 46) * channels;
		if (data[i + 3] !== 0) return false;
	}

	return true;
}
