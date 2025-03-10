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
	adminEmailChangeSchema,
	adminPasswordChangeSchema,
	capeSchema,
	sessionRemoveSchema,
	skinSchema,
	usernameChangeSchema,
	uuidChangeSchema,
} from "./schemas";
import { lucia } from "$lib/server/auth";
import { error, redirect } from "@sveltejs/kit";
import type { Selectable } from "kysely";
import type { DB } from "$lib/db/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import { ToastLevel } from "$lib/components/toast";

export const load = async ({ locals, params }) => {
	const skinChangeForm = await superValidate(zod(skinSchema), {
		id: "skinChangeForm",
	});
	const capeChangeForm = await superValidate(zod(capeSchema), {
		id: "capeChangeForm",
	});
	const sessionRemoveForm = await superValidate(zod(sessionRemoveSchema), {
		id: "sessionRemoveForm",
	});
	const usernameChangeForm = await superValidate(zod(usernameChangeSchema), {
		id: "usernameChangeForm",
	});
	const uuidChangeForm = await superValidate(zod(uuidChangeSchema), {
		id: "usernameChangeForm",
	});
	const skinRemoveForm = await superValidate(zod(z.object({})), {
		id: "skinRemoveForm",
	});
	const capeRemoveForm = await superValidate(zod(z.object({})), {
		id: "capeRemoveForm",
	});
	const emailChangeForm = await superValidate(zod(z.object({})), {
		id: "emailChangeForm",
	});
	const passwordChangeForm = await superValidate(zod(z.object({})), {
		id: "passwordChangeForm",
	});
	const emailVerifyForm = await superValidate(zod(z.object({})), {
		id: "emailVerifyForm",
	});
	let user: Selectable<DB["User"]>;
	let sessions: Selectable<DB["Session"]>[];

	if (params.id != undefined) {
		if (locals.user?.role != "ADMIN") {
			return error(404, "Not found");
		}

		const dbUser = await db
			.selectFrom("User")
			.selectAll()
			.where("id", "=", params.id)
			.executeTakeFirst();

		if (dbUser == undefined) {
			return error(404, "Not found");
		}
		user = dbUser;

		sessions = await db
			.selectFrom("Session")
			.selectAll()
			.where("user_id", "=", user!.id)
			.execute();
	} else {
		user = await db
			.selectFrom("User")
			.selectAll()
			.where("id", "=", locals.user!.id)
			.executeTakeFirstOrThrow();

		sessions = await db
			.selectFrom("Session")
			.selectAll()
			.where("user_id", "=", locals.user!.id)
			.execute();
	}

	let isSelf;
	if (params.id == undefined) {
		isSelf = true;
	} else {
		isSelf = params.id == locals.user!.id;
	}

	return {
		skinChangeForm,
		capeChangeForm,
		sessionRemoveForm,
		usernameChangeForm,
		uuidChangeForm,
		skinRemoveForm,
		capeRemoveForm,
		emailChangeForm,
		passwordChangeForm,
		emailVerifyForm,
		user,
		sessions,
		currentSession: locals.session!,
		isSelf,
		userRole: locals.user?.role,
	};
};

export const actions = {
	changeSkin: async ({ request, locals }) => {
		const form = await superValidate(request, zod(skinSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		await saveSkin(form.data.skin, locals.user!.id);

		return message(form, {
			type: ToastLevel.Success,
			text: "Скин был изменён!",
		});
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

		return message(form, {
			type: ToastLevel.Success,
			text: "Плащ был изменён!",
		});
	},
	deleteSkin: async ({ request, locals }) => {
		const form = await superValidate(request, zod(z.object({})));

		if (!form.valid) {
			return fail(400, { form });
		}

		deleteSkin(locals.user!.id);

		return message(form, {
			type: ToastLevel.Success,
			text: "Скин был удалён!",
		});
	},
	deleteCape: async ({ request, locals }) => {
		const form = await superValidate(request, zod(z.object({})));

		if (!form.valid) {
			return fail(400, { form });
		}

		deleteCape(locals.user!.id);

		return message(form, {
			type: ToastLevel.Success,
			text: "Плащ был удалён!",
		});
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

		return message(form, {
			type: ToastLevel.Success,
			text: "Никнейм был изменён!",
		});
	},
	changeEmail: async ({ request, locals }) => {
		const form = await superValidate(request, zod(z.object({})));

		if (!form.valid) {
			return fail(400, { form });
		}

		const user = await db
			.selectFrom("User")
			.selectAll()
			.where("id", "=", locals.user!.id)
			.executeTakeFirstOrThrow();

		if (await sendChangeEmailEmail(user)) {
			return message(form, {
				type: ToastLevel.Info,
				text: "На почту было отправлено сообщение с изменением почты!",
			});
		} else {
			return message(form, {
				type: ToastLevel.Error,
				text: "Ошибка при отправке сообщения, попробуйте позже.",
			});
		}
	},
	changePassword: async ({ request, locals }) => {
		const form = await superValidate(request, zod(z.object({})));

		if (!form.valid) {
			return fail(400, { form });
		}

		const user = await db
			.selectFrom("User")
			.selectAll()
			.where("id", "=", locals.user!.id)
			.executeTakeFirstOrThrow();

		if (await sendChangePasswordEmail(user)) {
			return message(form, {
				type: ToastLevel.Info,
				text: "На почту было отправлено сообщение с изменением пароля!",
			});
		} else {
			return message(form, {
				type: ToastLevel.Error,
				text: "Ошибка при отправке сообщения, попробуйте позже.",
			});
		}
	},
	verifyEmail: async ({ request, locals }) => {
		const form = await superValidate(request, zod(z.object({})));

		if (!form.valid) {
			return fail(400, { form });
		}

		const user = await db
			.selectFrom("User")
			.selectAll()
			.where("id", "=", locals.user!.id)
			.executeTakeFirstOrThrow();

		if (await sendVerificationEmail(user)) {
			return message(form, {
				type: ToastLevel.Info,
				text: "На почту было отправлено сообщение с подтверждением почты!",
			});
		} else {
			return message(form, {
				type: ToastLevel.Error,
				text: "Ошибка при отправке сообщения, попробуйте позже",
			});
		}
	},
	removeSession: async ({ request, locals }) => {
		const form = await superValidate(request, zod(sessionRemoveSchema));

		if (form.data.sessionId != null) {
			const sessions = await lucia.getUserSessions(locals.user!.id);
			const session = sessions.find(
				(session) => session.id == form.data.sessionId,
			);
			if (session != null) {
				if (session.userId == locals.user!.id) {
					await lucia.invalidateSession(form.data.sessionId);
					if (form.data.sessionId == locals.session?.id) {
						return redirect(302, "/login");
					}
				}
			}
		}

		return message(form, {
			type: ToastLevel.Success,
			text: "Сессия была удалена!",
		});
	},
	adminChangeUsername: async ({ request, params }) => {
		const form = await superValidate(request, zod(usernameChangeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (
			await db
				.selectFrom("User")
				.select("User.id")
				.where("username", "=", form.data.username)
				.executeTakeFirst()
		) {
			return message(form, {
				type: ToastLevel.Error,
				text: "Пользователь с таким именем уже существует!",
			});
		}

		await db
			.updateTable("User")
			.set({
				username: form.data.username,
			})
			.where("id", "=", params.id!)
			.execute();

		return message(form, {
			type: ToastLevel.Success,
			title: "Администратор",
			text: "Никнейм был изменён!",
		});
	},
	adminChangeUUID: async ({ request, params }) => {
		const form = await superValidate(request, zod(uuidChangeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (
			await db
				.selectFrom("User")
				.select("User.id")
				.where("uuid", "=", form.data.uuid)
				.executeTakeFirst()
		) {
			return message(form, {
				type: ToastLevel.Error,
				text: "Пользователь с таким UUID уже существует!",
			});
		}

		await db
			.updateTable("User")
			.set({
				uuid: form.data.uuid,
			})
			.where("id", "=", params.id!)
			.execute();

		return message(form, {
			type: ToastLevel.Success,
			title: "Администратор",
			text: "UUID был изменён!",
		});
	},
	adminChangeEmail: async ({ request, params }) => {
		const form = await superValidate(request, zod(adminEmailChangeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		await db
			.updateTable("User")
			.set({
				email: form.data.email,
			})
			.where("id", "=", params.id!)
			.execute();

		return message(form, {
			type: ToastLevel.Success,
			title: "Администратор",
			text: "Почта была изменена!",
		});
	},
	adminChangePassword: async ({ request, params }) => {
		const form = await superValidate(
			request,
			zod(adminPasswordChangeSchema),
		);

		if (!form.valid) {
			return fail(400, { form });
		}

		const user = await db
			.selectFrom("User")
			.select("salt")
			.where("id", "=", params.id!)
			.executeTakeFirstOrThrow();

		await db
			.updateTable("User")
			.set({
				password: bcrypt.hashSync(form.data.password + user.salt, 12),
			})
			.where("id", "=", params.id!)
			.execute();

		return message(form, {
			type: ToastLevel.Success,
			title: "Администратор",
			text: "Пароль был изменён!",
		});
	},
	adminVerifyEmail: async ({ request, params }) => {
		const form = await superValidate(request, zod(z.object({})));

		if (!form.valid) {
			return fail(400, { form });
		}

		await db
			.updateTable("User")
			.set({
				verified: true,
			})
			.where("id", "=", params.id!)
			.execute();

		return message(form, {
			type: ToastLevel.Success,
			title: "Администратор",
			text: "Почта была верифицирована!",
		});
	},
	adminUnVerifyEmail: async ({ request, params }) => {
		const form = await superValidate(request, zod(z.object({})));

		if (!form.valid) {
			return fail(400, { form });
		}

		await db
			.updateTable("User")
			.set({
				verified: false,
			})
			.where("id", "=", params.id!)
			.execute();

		return message(form, {
			type: ToastLevel.Success,
			title: "Администратор",
			text: "Почта была деверифицирована!",
		});
	},
};
