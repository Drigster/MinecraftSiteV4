import { dev } from "$app/environment";
import { init_db } from "$lib/server/db";
import { validate_session_token } from "$lib/server/auth";

export async function handle({ event, resolve }) {
	event.locals.db = init_db();

	const sessionToken = event.cookies.get("session");
	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await validate_session_token(sessionToken, {
		ip: event.getClientAddress(),
		user_agent: event.request.headers.get("User-Agent") || null,
	});
	if (session) {
		event.cookies.set("session", sessionToken, {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			expires: session.expires_at,
			secure: !dev,
		});
	} else {
		event.cookies.delete("session", {
			path: "/",
		});
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
}
