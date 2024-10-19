import { db } from "$lib/db";
import { createLauncherUserSession } from "$lib/util.server.js";

import { json } from "@sveltejs/kit";

interface Request {
	accessToken: string;
}

export async function POST({ request }) {
	const requestData: Request = await request.json();
	if (requestData.accessToken == undefined) {
		const error = {
			error: "Bad Request",
			code: 400,
		};

		return new Response(JSON.stringify(error), {
			headers: {
				"Content-Type": "application/json",
			},
			status: error.code,
		});
	}

	const session = await db
		.selectFrom("Session")
		.selectAll()
		.where("token", "=", requestData.accessToken)
		.executeTakeFirst();

	if (session == null) {
		const error = {
			error: "Пользователь не найден!",
			code: 404,
		};

		return new Response(JSON.stringify(error), {
			headers: {
				"Content-Type": "application/json",
			},
			status: error.code,
		});
	}

	const user = await db
		.selectFrom("User")
		.selectAll()
		.where("id", "=", session.user_id)
		.executeTakeFirstOrThrow();

	return json(createLauncherUserSession(session, user));
}
