import { setMessage, superValidate } from "sveltekit-superforms";
import { fail } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";
import db from "$lib/db.js";
import { sendChangePasswordEmail } from "$lib/util.server.js";

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

		const user = await db.user.findFirst({
			where: {
				OR: [
					{
						username: {
							equals: form.data.login,
							mode: "insensitive",
						},
					},
					{
						email: {
							equals: form.data.login,
							mode: "insensitive",
						},
					},
				],
			},
		});

		if (user != null) {
			await sendChangePasswordEmail(user);
			return setMessage(form, "На почту было отпралено сообщение со сменой пароля!");
		} else {
			return setMessage(form, "Пользователь не найден!");
		}
	},
};
