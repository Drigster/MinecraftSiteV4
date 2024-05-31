import { getUser } from "$lib/util.server.js";
import { redirect } from "@sveltejs/kit";

export async function load({ url, cookies }) {
	const user = await getUser(cookies.get("sessionToken"));
	if (user == null) {
		redirect(303, `/login?redirectTo=${url.pathname}`);
	} else if (!user.verified) {
		redirect(303, `/notverified?redirectTo=${url.pathname}`);
	} else {
		return {
			user,
			currentSession: cookies.get("sessionToken"),
		};
	}
}
