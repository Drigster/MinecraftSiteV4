import { createLauncherUserSession } from "$lib/server/api_utils";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { json } from "@sveltejs/kit";

interface Request {
	accessToken: string;
}

export async function POST({ request, locals }) {
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

	const user = await locals.db
		.selectFrom("User")
		.selectAll()
		.where("id", "=", session.user_id)
		.executeTakeFirstOrThrow();

	return json(
		await createLauncherUserSession(
			requestData.accessToken,
			{
				...session,
				expires_at: new Date(session.expires_at * 1000),
			},
			user,
		),
	);
}
