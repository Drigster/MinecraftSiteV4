import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
	if (locals.user != null) redirect(303, "/profile");
};
