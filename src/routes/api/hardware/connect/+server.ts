import { API_BEARER } from "$env/static/private";
import { json } from "@sveltejs/kit";

type Request = {
	hardware: {
		id: `h_${string}`;
		publicKey: string;
	};
	sessionID: string;
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
	if (
		requestData.hardware?.id == undefined ||
		requestData.hardware?.publicKey == undefined ||
		requestData.sessionID == undefined
	) {
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
		.select("user_id")
		.where("id", "=", requestData.sessionID)
		.executeTakeFirst();

	if (session == null) {
		const error = {
			error: "session not found",
			code: 404,
		};

		return json(error, {
			status: error.code,
		});
	}

	const hardware = await locals.db
		.selectFrom("Hardware")
		.select("id")
		.where("id", "=", requestData.hardware.id)
		.executeTakeFirst();

	if (hardware == null) {
		const error = {
			error: "hardware not found",
			code: 404,
		};

		return json(error, {
			status: error.code,
		});
	}

	await locals.db
		.insertInto("_HardwareToUser")
		.values({
			A: hardware.id,
			B: session.user_id,
		})
		.executeTakeFirstOrThrow();

	return json(
		{
			message: "success",
		},
		{
			status: 200,
		},
	);
}
