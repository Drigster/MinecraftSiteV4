import { fail, message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import fs from "fs";
import { deleteCape, deleteSkin, getUser, saveSkin } from "$lib/util.server.js";
import { redirect } from "@sveltejs/kit";
import db from "$lib/db";
import {
	capeRemoveSchema,
	capeSchema,
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

	const user = (await parent()).user;
	const currentSession = (await parent()).currentSession;

	return {
		skinChangeForm,
		capeChangeForm,
		sessionRemoveForm,
		usernameChangeForm,
		skinRemoveForm,
		capeRemoveForm,
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

		return message(form, "You have uploaded a valid file!");
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

		return message(form, "You have uploaded a valid file!");
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

		return message(form, "You have removed a session!");
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

		return message(form, "You removed your skin!");
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

		return message(form, "You removed your cape!");
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

		return message(form, "You changed your username!");
	},
};
