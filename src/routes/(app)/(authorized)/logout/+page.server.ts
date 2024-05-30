import { redirect } from "@sveltejs/kit";
import db from "$lib/db.js";

export const load = async ({ parent, cookies, url }) => {
	const user = (await parent()).user;
	const token = (await parent()).currentSession;
	if (user != null) {
		await db.session.delete({
			where: {
				token: token,
			},
		});

		cookies.delete("sessionToken", { path: "/" });
	}

	const redirectTo = url.searchParams.get("redirectTo");
	if (redirectTo != null) {
		return redirect(303, redirectTo);
	}
	return redirect(303, "/");
};
