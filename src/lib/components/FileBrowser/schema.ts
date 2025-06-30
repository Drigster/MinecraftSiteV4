import { z } from "zod";

export const uploadFileSchema = z.object({
	file: z.instanceof(File, { message: "Please upload a file." }),
});

export type UploadFileSchema = typeof uploadFileSchema;
