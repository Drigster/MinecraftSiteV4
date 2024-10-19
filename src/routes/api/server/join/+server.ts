import { db } from "$lib/db";

interface Request {
	username: string;
	uuid: string;
	accessToken: string;
	serverId: string;
}

export async function POST({ request }) {
	const requestData: Request = await request.json();
	if (
		requestData.username == undefined ||
		requestData.accessToken == undefined ||
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

	await db
		.updateTable("Session")
		.where("id", "=", session.id)
		.set({
			user_id: requestData.uuid,
		})
		.execute();

	const message = {
		message: "OK",
		code: 200,
	};

	return new Response(JSON.stringify(message), {
		headers: {
			"Content-Type": "application/json",
		},
		status: message.code,
	});
}
