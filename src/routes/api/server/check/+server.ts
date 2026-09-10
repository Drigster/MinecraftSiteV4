import { createLauncherUser } from "$lib/server/api_utils";
import { json } from "@sveltejs/kit";

interface Request {
	username: string;
	serverId: string;
}

export async function POST({ request, locals }) {
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

	const session = await locals.db
		.selectFrom("Session")
		.selectAll()
		.where("server_id", "=", requestData.serverId)
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

	const user = await locals.db
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

	await locals.db
		.updateTable("User")
		.where("id", "=", user.id)
		.set({
			lastPlayed: new Date().toISOString(),
		})
		.execute();

	return json(await createLauncherUser(user));
}
