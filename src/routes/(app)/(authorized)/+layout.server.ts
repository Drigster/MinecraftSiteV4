import { redirect } from "@sveltejs/kit";

export async function load({ url, locals }) {
	if (locals.user == null) {
		redirect(303, "/login?redirectTo=" + url.pathname);
	} else if (!locals.user.verified) {
		redirect(303, "/notverified?redirectTo=" + url.pathname);
	}
}
