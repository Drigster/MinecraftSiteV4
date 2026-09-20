import { redirect } from "@sveltejs/kit";

export async function load({ locals, cookies }) {
	if (cookies.get("wip") != "off") {
		return redirect(307, "/under_construction");
	}

	return {
		user: locals.user,
	};
}
