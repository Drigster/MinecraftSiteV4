import { lucia } from "$lib/server/auth.js";

export function POST({ locals, cookies }) {
	if (locals.session != null) {
		lucia.invalidateSession(locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: "/",
			...sessionCookie.attributes,
		});

		locals.session = null;
		locals.user = null;
	}

	return new Response("OK");
}
