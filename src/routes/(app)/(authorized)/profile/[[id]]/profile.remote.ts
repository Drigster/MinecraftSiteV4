import { error, redirect } from "@sveltejs/kit";
import { form, getRequestEvent } from "$app/server";
import {
	deleteCape,
	deleteSkin,
	saveSkin,
	sendChangeEmailEmail,
	sendChangePasswordEmail,
	sendVerificationEmail,
} from "$lib/util.server";
import { db } from "$lib/db";
import { setFlash } from "sveltekit-flash-message/server";
import { capeSchema, skinSchema, usernameChangeSchema } from "./schemas";
import fs from "node:fs";

export const removeSkin = form(async () => {
	const { locals, cookies } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	} else if (!locals.user.verified) {
		redirect(303, "/notverified");
	}

	deleteSkin(locals.user!.id);

	setFlash(
		{
			type: "success",
			message: "Скин успешно удалён.",
		},
		cookies,
	);
	return { success: true };
});

export const removeCape = form(async () => {
	const { locals, cookies } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	} else if (!locals.user.verified) {
		redirect(303, "/notverified");
	}

	deleteCape(locals.user!.id);

	setFlash(
		{
			type: "success",
			message: "Плащ успешно удалён.",
		},
		cookies,
	);
	return { success: true };
});

export const changeUsername = form(async (data) => {
	const { locals, cookies } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	} else if (!locals.user.verified) {
		redirect(303, "/notverified");
	}

	const result = usernameChangeSchema.safeParse(
		Object.fromEntries(data.entries()),
	);
	if (!result.success) {
		setFlash(
			{
				type: "error",
				message: result.error.issues[0].message,
			},
			cookies,
		);
		return { success: false };
	}

	if (result.data.username == locals.user.username) {
		return { success: true };
	}

	await db
		.updateTable("User")
		.where("id", "=", locals.user!.id)
		.set({
			username: result.data.username,
		})
		.execute();

	setFlash(
		{
			type: "success",
			message: "Никнейм упешно изменён.",
		},
		cookies,
	);
	return { success: true };
});

export const changeUUID = form(async (data) => {
	const { locals, cookies } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	} else if (!locals.user.verified) {
		redirect(303, "/notverified");
	} else if (locals.user.role != "ADMIN") {
		error(403);
	}

	const uuid = data.get("uuid");

	if (typeof uuid !== "string") {
		error(400);
	}

	await db
		.updateTable("User")
		.where("id", "=", locals.user!.id)
		.set({
			uuid: uuid,
		})
		.execute();

	setFlash(
		{
			type: "success",
			message: "UUID упешно изменён.",
		},
		cookies,
	);
	return { success: true };
});

export const changeEmail = form(async () => {
	const { locals, cookies } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	} else if (!locals.user.verified) {
		redirect(303, "/notverified");
	}

	const user = await db
		.selectFrom("User")
		.selectAll()
		.where("id", "=", locals.user.id)
		.executeTakeFirstOrThrow();

	if (await sendChangeEmailEmail(user)) {
		setFlash(
			{
				type: "success",
				message: "На почту отправлено сообщение с изменением почты.",
			},
			cookies,
		);
	} else {
		setFlash(
			{
				type: "error",
				message:
					"Не удалось отправить сообщение на почту. Попробуйте позже.",
			},
			cookies,
		);
	}
});

export const changePassword = form(async () => {
	const { locals, cookies } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	} else if (!locals.user.verified) {
		redirect(303, "/notverified");
	}

	const user = await db
		.selectFrom("User")
		.selectAll()
		.where("id", "=", locals.user.id)
		.executeTakeFirstOrThrow();

	if (await sendChangePasswordEmail(user)) {
		setFlash(
			{
				type: "success",
				message: "На почту отправлено сообщение с изменением пароля.",
			},
			cookies,
		);
	} else {
		setFlash(
			{
				type: "error",
				message:
					"Не удалось отправить сообщение на почту. Попробуйте позже.",
			},
			cookies,
		);
	}
});

export const verifyEmail = form(async () => {
	const { locals, cookies } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	}

	const user = await db
		.selectFrom("User")
		.selectAll()
		.where("id", "=", locals.user.id)
		.executeTakeFirstOrThrow();

	if (await sendVerificationEmail(user)) {
		setFlash(
			{
				type: "success",
				message: "На почту отправлено сообщение с верификацией почты.",
			},
			cookies,
		);
	} else {
		setFlash(
			{
				type: "error",
				message:
					"Не удалось отправить сообщение на почту. Попробуйте позже.",
			},
			cookies,
		);
	}
});

export const uploadSkin = form(async (data) => {
	const { locals, cookies } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	} else if (!locals.user.verified) {
		redirect(303, "/notverified");
	}

	const result = await skinSchema.safeParseAsync(
		Object.fromEntries(data.entries()),
	);
	if (!result.success) {
		setFlash(
			{
				type: "error",
				message: result.error.issues[0].message,
			},
			cookies,
		);
		return { success: false };
	}

	await saveSkin(result.data.skin, locals.user!.id);

	setFlash(
		{
			type: "success",
			message: "Скин успешно изменён.",
		},
		cookies,
	);
	return { success: true };
});

export const uploadCape = form(async (data) => {
	const { locals, cookies } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	} else if (!locals.user.verified) {
		redirect(303, "/notverified");
	}

	const result = await capeSchema.safeParseAsync(
		Object.fromEntries(data.entries()),
	);
	if (!result.success) {
		setFlash(
			{
				type: "error",
				message: result.error.issues[0].message,
			},
			cookies,
		);
		return { success: false };
	}

	if (!fs.existsSync("./files/capes/")) {
		fs.mkdirSync("./files/capes/", { recursive: true });
	}
	fs.writeFileSync(
		"./files/capes/" + locals.user!.id + ".png",
		Buffer.from(await result.data.cape.arrayBuffer()),
	);

	setFlash(
		{
			type: "success",
			message: "Плащ успешно изменён.",
		},
		cookies,
	);
	return { success: true };
});
