import { z } from "zod/v4";
import sizeOf from "image-size";

export const skinSchema = z.object({
	skin: z
		.instanceof(File, {
			error: "Please upload a file.",
		})
		.refine((f) => f.type == "image/png", "Файл должен быть в PNG формате.")
		.refine(async (f) => {
			const file = (await f.stream().getReader().read()).value;
			if (file != undefined) {
				const size = sizeOf(file);
				return size.height == 64 && size.width == 64;
			}

			return false;
		}, "Файл должен быть в размере 64x64 px."),
});

export type SkinSchema = typeof skinSchema;

export const capeSchema = z.object({
	cape: z
		.instanceof(File, {
			error: "Please upload a file.",
		})
		.refine(
			(f) => f.type == "image/png",
			"Файл должен быть в PNG формате.",
		),
});

export type CapeSchema = typeof capeSchema;

export const sessionRemoveSchema = z.object({
	sessionId: z.string(),
});

export const usernameChangeSchema = z.object({
	username: z
		.string()
		.regex(
			/^[a-zA-Z0-9_]+$/,
			"Никнейм имеет недопустимые символы, разрещены только английские буквы, цыфры и _",
		)
		.min(1, "Никнейм не может быть пустым")
		.max(16, "Никнейм не может быть длинее 16 символов"),
});

export const adminEmailChangeSchema = z.object({
	email: z.email(),
});

export const uuidChangeSchema = z.object({
	uuid: z
		.string()
		.length(36, "Длина UUID должна быть 36 символов")
		.regex(
			/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
			"UUID имеет недопустимые символы",
		),
});

export const adminPasswordChangeSchema = z.object({
	password: z.string().min(1, "Пароль не может быть пустым"),
});
