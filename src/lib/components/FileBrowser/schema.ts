import { z } from "zod/v4";

export const uploadFileSchema = z.object({
	file: z.instanceof(File, {
		error: "Please upload a file.",
	}),
});

export type UploadFileSchema = typeof uploadFileSchema;
