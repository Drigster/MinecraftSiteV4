import { setMessage, superValidate } from "sveltekit-superforms";
import { fail } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod/v4";

import { sendChangePasswordEmail } from "$lib/util.server.js";
import { db } from "$lib/db";

const schema = z.object({
	login: z.string().min(1, "Логин не может быть пустым"),
});

export const load = async () => {
	const form = await superValidate(zod(schema));

	return { form };
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const user = await db
			.selectFrom("User")
			.selectAll()
			.where((eb) =>
				eb.or([
					eb("username", "=", form.data.login),
					eb("email", "=", form.data.login),
				]),
			)
			.executeTakeFirst();

		if (user != null) {
			if (await sendChangePasswordEmail(user)) {
				return setMessage(form, {
					type: "info",
					text: "На почту было отправлено сообщение с изменением пароля!",
				});
			} else {
				return setMessage(form, {
					type: "error",
					text: "Ошибка при отправке сообщения попробуйте позже",
				});
			}
		} else {
			return setMessage(form, {
				type: "error",
				text: "Пользователь не найден!",
			});
		}
	},
};
