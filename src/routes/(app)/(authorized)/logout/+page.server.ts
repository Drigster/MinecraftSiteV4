import { lucia } from "$lib/server/auth.js";
import { redirect } from "@sveltejs/kit";

export const load = async ({ locals, cookies }) => {
	lucia.invalidateSession(locals.session!.id);
	const sessionCookie = lucia.createBlankSessionCookie();
	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: ".",
		...sessionCookie.attributes,
	});

	return redirect(302, "/");
};
