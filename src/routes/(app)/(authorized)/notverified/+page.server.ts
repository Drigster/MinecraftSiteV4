import { setMessage, superValidate } from "sveltekit-superforms";
import { fail, redirect } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";
import { sendVerificationEmail } from "$lib/util.server";
import { db } from "$lib/db/index.js";

const schema = z.object({
	verify: z.string(),
});

export const load = async ({ url, locals }) => {
	if (locals.user!.verified) {
		const redirectTo = url.searchParams.get("redirectTo");
		if (redirectTo != null) {
			return redirect(303, redirectTo);
		}
	}

	const form = await superValidate(zod(schema));

	return { form };
};

export const actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const user = await db
			.selectFrom("User")
			.selectAll()
			.where("id", "=", locals.user!.id)
			.executeTakeFirstOrThrow();

		if (await sendVerificationEmail(user)) {
			return setMessage(
				form,
				"Сообщение с подтверждением было отправлено повторно",
			);
		} else {
			return setMessage(
				form,
				"Ошибка при отправке сообщения попробуйте позже",
			);
		}
	},
};
