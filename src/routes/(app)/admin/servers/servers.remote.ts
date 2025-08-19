import { form, getRequestEvent } from "$app/server";
import { db } from "$lib/db";
import { error, redirect } from "@sveltejs/kit";
import { generateIdFromEntropySize } from "lucia";
import { setFlash } from "sveltekit-flash-message/server";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import sizeOf from "image-size";

const serverCreateSchema = z.object({
	serverName: z.string().min(1, "Название не может быть пустым"),
	description: z.string(),
	serverArt: z
		.file()
		.mime("image/png")
		.refine(async (f) => {
			const file = (await f.stream().getReader().read()).value;
			if (file != undefined) {
				const size = sizeOf(file);
				return size.height == 600 && size.width == 960;
			}

			return false;
		}, "Файл должен быть в размере 600x960 px."),
});

export const createServer = form(async (data) => {
	const { locals, cookies } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	} else if (!locals.user.verified) {
		redirect(303, "/notverified");
	} else if (locals.user.role != "ADMIN") {
		error(403);
	}

	const result = serverCreateSchema.safeParse(
		Object.fromEntries(data.entries()),
	);
	if (!result.success) {
		return {
			success: false,
			error: z.flattenError(result.error).fieldErrors,
		};
	}

	const _server = await db
		.insertInto("Server")
		.values({
			id: generateIdFromEntropySize(10),
			uuid: uuidv4(),
			name: result.data.serverName,
			codename: "123",
			description: result.data.description,
			ip: "foxy.town",
			port: 25565,
			localIp: "127.0.0.1",
			localPort: 5775,
			ownerId: locals.user!.id,
			status: "HIDDEN",
			configHash: "",
		})
		.executeTakeFirstOrThrow();

	setFlash(
		{
			type: "success",
			message: "Сервер создан.",
		},
		cookies,
	);
	return { success: true };
});
