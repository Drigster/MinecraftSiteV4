import { fail, message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import fs from "fs";
import {
	deleteCape,
	deleteSkin,
	saveSkin,
	sendChangeEmailEmail,
	sendChangePasswordEmail,
	sendVerificationEmail,
} from "$lib/util.server.js";
import { db } from "$lib/db";
import {
	capeRemoveSchema,
	capeSchema,
	emailChangeSchema,
	emailVerifySchema,
	passwordChangeSchema,
	sessionRemoveSchema,
	skinRemoveSchema,
	skinSchema,
	usernameChangeSchema,
} from "./schemas";
import { lucia } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
	const skinChangeForm = await superValidate(zod(skinSchema));
	const capeChangeForm = await superValidate(zod(capeSchema));
	const sessionRemoveForm = await superValidate(zod(sessionRemoveSchema));
	const usernameChangeForm = await superValidate(zod(usernameChangeSchema));
	const skinRemoveForm = await superValidate(zod(skinRemoveSchema));
	const capeRemoveForm = await superValidate(zod(capeRemoveSchema));
	const emailChangeForm = await superValidate(zod(emailChangeSchema));
	const passwordChangeForm = await superValidate(zod(passwordChangeSchema));
	const emailVerifyForm = await superValidate(zod(emailVerifySchema));

	const user = await db
		.selectFrom("User")
		.selectAll()
		.where("id", "=", locals.user!.id)
		.executeTakeFirstOrThrow();

	const sessions = await db
		.selectFrom("Session")
		.selectAll()
		.where("user_id", "=", locals.user!.id)
		.execute();

	return {
		skinChangeForm,
		capeChangeForm,
		sessionRemoveForm,
		usernameChangeForm,
		skinRemoveForm,
		capeRemoveForm,
		emailChangeForm,
		passwordChangeForm,
		emailVerifyForm,
		user,
		sessions,
		currentSession: locals.session!,
	};
};

export const actions = {
	changeSkin: async ({ request, locals }) => {
		const form = await superValidate(request, zod(skinSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		await saveSkin(form.data.skin, locals.user!.id);

		return message(form, "Скин был изменён!");
	},
	changeCape: async ({ request, locals }) => {
		const form = await superValidate(request, zod(capeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (!fs.existsSync("./files/capes/")) {
			fs.mkdirSync("./files/capes/", { recursive: true });
		}
		fs.writeFileSync(
			"./files/capes/" + locals.user!.id + ".png",
			Buffer.from(await form.data.cape.arrayBuffer()),
		);

		return message(form, "Плащ был изменён!");
	},
	removeSession: async ({ request, locals }) => {
		const form = await superValidate(request, zod(sessionRemoveSchema));

		if (form.data.sessionId != null) {
			await lucia.invalidateSession(form.data.sessionId);
			if (form.data.sessionId == locals.session?.id) {
				return redirect(302, "/login");
			}
		}

		return message(form, "Сессия была удалена!");
	},
	deleteSkin: async ({ request, locals }) => {
		const form = await superValidate(request, zod(skinRemoveSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		deleteSkin(locals.user!.id);

		return message(form, "Скин был удалён!");
	},
	deleteCape: async ({ request, locals }) => {
		const form = await superValidate(request, zod(capeRemoveSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		deleteCape(locals.user!.id);

		return message(form, "Плащ был удалён!");
	},
	changeUsername: async ({ request, locals }) => {
		const form = await superValidate(request, zod(usernameChangeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		await db
			.updateTable("User")
			.where("id", "=", locals.user!.id)
			.set({
				username: form.data.username,
			})
			.execute();

		// .user.update({
		// 	where: {
		// 		id: user.id,
		// 	},
		// 	data: {
		// 		username: form.data.username,
		// 	},
		// });

		return message(form, "Никнейм был изменён!");
	},
	changeEmail: async ({ request, locals }) => {
		const form = await superValidate(request, zod(emailChangeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const user = await db
			.selectFrom("User")
			.selectAll()
			.where("id", "=", locals.user!.id)
			.executeTakeFirstOrThrow();

		sendChangeEmailEmail(user);

		return message(
			form,
			"На почту было отправлено сообщение с изменением почты!",
		);
	},
	changePassword: async ({ request, locals }) => {
		const form = await superValidate(request, zod(passwordChangeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const user = await db
			.selectFrom("User")
			.selectAll()
			.where("id", "=", locals.user!.id)
			.executeTakeFirstOrThrow();

		sendChangePasswordEmail(user);

		return message(
			form,
			"На почту было отправлено сообщение с изменением пароля!",
		);
	},
	verifyEmail: async ({ request, locals }) => {
		const form = await superValidate(request, zod(emailVerifySchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const user = await db
			.selectFrom("User")
			.selectAll()
			.where("id", "=", locals.user!.id)
			.executeTakeFirstOrThrow();

		sendVerificationEmail(user);

		return message(
			form,
			"На почту было отправлено сообщение с подтверждением почты!",
		);
	},
};
