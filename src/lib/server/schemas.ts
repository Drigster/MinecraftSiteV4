import * as v from "valibot";
import sharp from "sharp";

export const uploadSkinSchema = v.objectAsync({
	skin: v.pipeAsync(
		v.file(),
		v.mimeType(
			["image/jpeg", "image/png"],
			"Принимаются только PNG и JPEG форматы",
		),
		v.checkAsync(async (input) => {
			const buffer = Buffer.from(await input.arrayBuffer());
			const metadata = await sharp(buffer).metadata();
			if (metadata.width == 64 && metadata.height == 64) {
				return true;
			}
			return false;
		}, "Размер скина должен быть 64x64"),
	),
});

export const uploadCapeSchema = v.objectAsync({
	cape: v.pipeAsync(
		v.file(),
		v.mimeType(
			["image/jpeg", "image/png"],
			"Принимаются только PNG и JPEG форматы",
		),
		v.checkAsync(async (input) => {
			const buffer = Buffer.from(await input.arrayBuffer());
			const metadata = await sharp(buffer).metadata();
			if (metadata.width == 64 && metadata.height == 32) {
				return true;
			}
			return false;
		}, "Размер плаща должен быть 64x32"),
	),
});
