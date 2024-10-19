import { json } from "@sveltejs/kit";
import { createLauncherUser } from "$lib/util.server.js";
import { db } from "$lib/db/index.js";
import { DateTime } from "luxon";

interface Request {
	username: string;
	serverId: string;
}

export async function POST({ request }) {
	const requestData: Request = await request.json();
	if (
		requestData.username == undefined ||
		requestData.serverId == undefined
	) {
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
		.where("serverId", "=", requestData.serverId)
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

	if (user.username != requestData.username) {
		const error = {
			error: "Сервер и пользователь не совпадают!",
			code: 403,
		};

		return new Response(JSON.stringify(error), {
			headers: {
				"Content-Type": "application/json",
			},
			status: error.code,
		});
	}

	await db
		.updateTable("User")
		.where("id", "=", user.id)
		.set({
			lastPlayed: DateTime.now().toSQL(),
		})
		.execute();

	return json(createLauncherUser(user));
}
