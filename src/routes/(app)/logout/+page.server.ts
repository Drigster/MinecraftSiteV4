import { redirect } from "@sveltejs/kit";
import db from "$lib/db.js";

export const load = async ({ parent, cookies, url }) => {
	const user = (await parent()).user;
	if (user != null) {
		await db.session.delete({
			where: {
				token: cookies.get("sessionToken"),
			},
		});

		cookies.delete("sessionToken", { path: "/" });
	}

	(await parent()).user = undefined;

	const redirectTo = url.searchParams.get("redirectTo");
	if (redirectTo != null) {
		return redirect(303, redirectTo);
	}
	return redirect(303, "/");
};
