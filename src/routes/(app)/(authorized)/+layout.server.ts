import { redirect } from "@sveltejs/kit";

export async function load({ url, locals }) {
	if (locals.user == null) redirect(302, "/login?redirectTo=" + url.pathname);
}
