import { z } from "zod";
import sizeOf from "image-size";

export const skinSchema = z.object({
	skin: z
		.instanceof(File, { message: "Please upload a file." })
		.refine((f) => f.type == "image/png", "Файл должен быть в PNG формате.")
		.refine(async (f) => {
			let file = (await f.stream().getReader().read()).value;
			if(file != undefined){
				let size = sizeOf(file);
				return size.height == 64 && size.width == 64
			}

			return false;
		}, "Файл должен быть в размере 64x64 px."),
});

export const capeSchema = z.object({
	cape: z
		.instanceof(File, { message: "Please upload a file." })
		.refine((f) => f.type == "image/png", "Файл должен быть в PNG формате."),
});

export const skinRemoveSchema = z.object({
	skinRemove: z.string().includes("remove")
});

export const capeRemoveSchema = z.object({
	capeRemove: z.string().includes("remove")
});

export const sessionRemoveSchema = z.object({
	token: z.string(),
});

export const usernameChangeSchema = z.object({
	username: z.string().min(1, "Никнейм не может быть пустым"),
});

export const emailChangeSchema = z.object({
	username: z.string().min(1, "Никнейм не может быть пустым"),
});