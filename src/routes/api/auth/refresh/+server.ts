import { db } from "$lib/db";
import { createLauncherUserSession } from "$lib/util.server.js";

import { json } from "@sveltejs/kit";
import { generateIdFromEntropySize } from "lucia";
import { DateTime } from "luxon";

interface Request {
	refreshToken: string;
}

export async function POST({ request }) {
	const requestData: Request = await request.json();
	if (requestData.refreshToken == undefined) {
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
		.where("token", "=", requestData.refreshToken)
		.executeTakeFirst();

	if (session == undefined) {
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

	await db
		.updateTable("Session")
		.where("id", "=", session.id)
		.set({
			refreshToken: generateIdFromEntropySize(32),
			expires_at: DateTime.now().plus({ week: 1 }).toSQL(),
		})
		.execute();

	const user = await db
		.selectFrom("User")
		.selectAll()
		.where("id", "=", session.user_id)
		.executeTakeFirstOrThrow();

	return json(createLauncherUserSession(session, user));
}
