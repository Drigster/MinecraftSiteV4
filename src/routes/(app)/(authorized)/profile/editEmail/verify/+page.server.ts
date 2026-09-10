import { resolve } from "$app/paths";
import { error, redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
	if (locals.user == null) {
		error(404);
	}

	const request = await locals.db
		.selectFrom("ChangeEmailRequest")
		.select(["expires_at", "code_hash", "new_email"])
		.where("user_id", "=", locals.user.id)
		.executeTakeFirst();

	if (request == undefined) {
		redirect(303, resolve("/profile/editEmail"));
	}
};
