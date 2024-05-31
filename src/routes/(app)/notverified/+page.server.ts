import { setMessage, superValidate } from "sveltekit-superforms";
import { fail, redirect } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";
import { getUser, sendVerificationEmail } from "$lib/util.server";

const schema = z.object({
	verify: z.string(),
});

export const load = async ({ cookies, url }) => {
	const user = await getUser(cookies.get("sessionToken"));
	if (user == null) {
		redirect(303, "/");
	} else if (user.verified) {
		const redirectTo = url.searchParams.get("redirectTo");
		if (redirectTo != null) {
			return redirect(303, redirectTo);
		}
	}

	const form = await superValidate(zod(schema));

	return { form };
};
3;

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const user = await getUser(cookies.get("sessionToken"));
		if (user == null) {
			redirect(303, "/");
		}

		sendVerificationEmail(user);

		return setMessage(form, "Сообщение с подтверждением было отправлено повторно");
	},
};
