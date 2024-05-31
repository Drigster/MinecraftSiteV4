import { fail, message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import fs from "fs";
import {
	deleteCape,
	deleteSkin,
	getUser,
	saveSkin,
	sendChangeEmailEmail,
	sendChangePasswordEmail,
	sendVerificationEmail,
} from "$lib/util.server.js";
import { redirect } from "@sveltejs/kit";
import db from "$lib/db";
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

export const load = async ({ parent }) => {
	const skinChangeForm = await superValidate(zod(skinSchema));
	const capeChangeForm = await superValidate(zod(capeSchema));
	const sessionRemoveForm = await superValidate(zod(sessionRemoveSchema));
	const usernameChangeForm = await superValidate(zod(usernameChangeSchema));
	const skinRemoveForm = await superValidate(zod(skinRemoveSchema));
	const capeRemoveForm = await superValidate(zod(capeRemoveSchema));
	const emailChangeForm = await superValidate(zod(emailChangeSchema));
	const passwordChangeForm = await superValidate(zod(passwordChangeSchema));
	const emailVerifyForm = await superValidate(zod(emailVerifySchema));

	const user = (await parent()).user;
	const currentSession = (await parent()).currentSession;

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
		currentSession,
	};
};

export const actions = {
	changeSkin: async ({ request, cookies }) => {
		const user = await getUser(cookies.get("sessionToken"));
		if (user == null) {
			return redirect(303, `/logout?redirectTo=/login`);
		}

		const form = await superValidate(request, zod(skinSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		await saveSkin(form.data.skin, user.id);

		return message(form, "Скин был изменён!");
	},
	changeCape: async ({ request, cookies }) => {
		const user = await getUser(cookies.get("sessionToken"));
		if (user == null) {
			return redirect(303, `/logout?redirectTo=/login`);
		}

		const form = await superValidate(request, zod(capeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		fs.writeFileSync(
			"./files/capes/" + user.id + ".png",
			Buffer.from(await form.data.cape.arrayBuffer()),
		);

		return message(form, "Плащ был изменён!");
	},
	removeSession: async ({ request }) => {
		const form = await superValidate(request, zod(sessionRemoveSchema));

		const token = form.data.token;
		if (token != null) {
			await db.session.delete({
				where: {
					token: token,
				},
			});
		}

		return message(form, "Сессия была удалена!");
	},
	deleteSkin: async ({ request, cookies }) => {
		const user = await getUser(cookies.get("sessionToken"));
		if (user == null) {
			return redirect(303, `/logout?redirectTo=/login`);
		}

		const form = await superValidate(request, zod(skinRemoveSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		deleteSkin(user.id);

		return message(form, "Скин был удалён!");
	},
	deleteCape: async ({ request, cookies }) => {
		const user = await getUser(cookies.get("sessionToken"));
		if (user == null) {
			return redirect(303, `/logout?redirectTo=/login`);
		}

		const form = await superValidate(request, zod(capeRemoveSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		deleteCape(user.id);

		return message(form, "Плащ был удалён!");
	},
	changeUsername: async ({ request, cookies }) => {
		const user = await getUser(cookies.get("sessionToken"));
		if (user == null) {
			return redirect(303, `/logout?redirectTo=/login`);
		}

		const form = await superValidate(request, zod(usernameChangeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		await db.user.update({
			where: {
				id: user.id,
			},
			data: {
				username: form.data.username,
			},
		});

		return message(form, "Никнейм был изменён!");
	},
	changeEmail: async ({ request, cookies }) => {
		const user = await getUser(cookies.get("sessionToken"));
		if (user == null) {
			return redirect(303, `/logout?redirectTo=/login`);
		}

		const form = await superValidate(request, zod(emailChangeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		sendChangeEmailEmail(user);

		return message(form, "На почту было отправлено сообщение с изменением почты!");
	},
	changePassword: async ({ request, cookies }) => {
		const user = await getUser(cookies.get("sessionToken"));
		if (user == null) {
			return redirect(303, `/logout?redirectTo=/login`);
		}

		const form = await superValidate(request, zod(passwordChangeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		sendChangePasswordEmail(user);

		return message(form, "На почту было отправлено сообщение с изменением пароля!");
	},
	verifyEmail: async ({ request, cookies }) => {
		console.log(123);
		const user = await getUser(cookies.get("sessionToken"));
		if (user == null) {
			return redirect(303, `/logout?redirectTo=/login`);
		}

		const form = await superValidate(request, zod(emailVerifySchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		sendVerificationEmail(user);

		return message(form, "На почту было отправлено сообщение с подтверждением почты!");
	},
};
