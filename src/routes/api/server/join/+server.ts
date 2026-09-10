import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";

interface Request {
	username?: string;
	uuid?: string;
	accessToken: string;
	serverId: string;
}

export async function POST({ request, locals }) {
	const requestData: Request = await request.json();
	if (
		(requestData.uuid == undefined && requestData.username == undefined) ||
		requestData.accessToken == undefined ||
		requestData.serverId == undefined
	) {
		const error = {
			error: "Bad Request",
			code: 400,
		};
		if (
			requestData.uuid == undefined &&
			requestData.username != undefined
		) {
			error.error = "Bad Request, uuid not found!";
		} else if (
			requestData.username == undefined &&
			requestData.uuid != undefined
		) {
			error.error = "Bad Request, username not found!";
		} else if (
			requestData.username == undefined &&
			requestData.uuid == undefined
		) {
			error.error = "Bad Request, username and uuid not found";
		} else if (requestData.accessToken == undefined) {
			error.error = "Bad Request, accessToken not found!";
		} else if (requestData.serverId == undefined) {
			error.error = "Bad Request, serverId not found!";
		}

		return new Response(JSON.stringify(error), {
			headers: {
				"Content-Type": "application/json",
			},
			status: error.code,
		});
	}

	const session_id = encodeHexLowerCase(
		sha256(new TextEncoder().encode(requestData.accessToken)),
	);
	const session = await locals.db
		.selectFrom("Session")
		.selectAll()
		.where("id", "=", session_id)
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

	await locals.db
		.updateTable("Session")
		.where("id", "=", session.id)
		.set({
			server_id: requestData.serverId,
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
