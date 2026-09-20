import { API_BEARER } from "$env/static/private";
import {
	createLauncherUserSession,
	type LauncherError,
} from "$lib/server/api_utils";
import { json } from "@sveltejs/kit";
import { DateTime } from "luxon";

type Request = {
	accessToken: string;
};

export async function POST({ request, locals }) {
	if (request.headers.get("Authorization") !== `Bearer ${API_BEARER}`) {
		const error = {
			error: "Unauthorized",
			code: 401,
		};

		return json(error, {
			status: error.code,
		});
	}

	const requestData: Request = await request.json();
	if (requestData.accessToken == undefined) {
		const error = {
			error: "Bad Request",
			code: 400,
		};

		return json(error, {
			status: error.code,
		});
	}

	const session = await locals.db
		.selectFrom("Session")
		.selectAll()
		.where("access_token", "=", requestData.accessToken)
		.executeTakeFirst();

	if (session == null) {
		const error: LauncherError = {
			error: "Token expired",
			code: 1001,
		};

		return json(error, { status: 401 });
	} else if (DateTime.now() >= DateTime.fromSeconds(session.expires_at)) {
		await locals.db
			.deleteFrom("Session")
			.where("id", "=", session.id)
			.execute();

		const error: LauncherError = {
			error: "Token expired",
			code: 1001,
		};

		return json(error, { status: 401 });
	} else if (
		DateTime.now() >= DateTime.fromSeconds(session.access_token_expires_at!)
	) {
		const error: LauncherError = {
			error: "Token expired",
			code: 1001,
		};

		return json(error, { status: 401 });
	}

	const user = await locals.db
		.selectFrom("User")
		.selectAll()
		.where("id", "=", session.user_id)
		.executeTakeFirstOrThrow();

	return json(await createLauncherUserSession(session, user));
}
