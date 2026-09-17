import { API_BEARER } from "$env/static/private";
import { type LauncherError } from "$lib/server/api_utils";
import { generate_session_token } from "$lib/server/auth.js";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { json } from "@sveltejs/kit";
import { DateTime, Interval } from "luxon";

type Request = {
	refreshToken: string;
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
	if (requestData.refreshToken == undefined) {
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
		.where("refresh_token", "=", requestData.refreshToken)
		.executeTakeFirst();

	if (session == null) {
		const error: LauncherError = {
			error: "auth.invalidtoken",
			code: 1002,
		};

		return json(error, { status: 401 });
	} else if (DateTime.now() >= DateTime.fromSeconds(session.expires_at)) {
		await locals.db
			.deleteFrom("Session")
			.where("id", "=", session.id)
			.execute();

		const error: LauncherError = {
			error: "auth.invalidtoken",
			code: 1002,
		};

		return json(error, { status: 401 });
	}

	const access_token = encodeHexLowerCase(
		sha256(new TextEncoder().encode(generate_session_token())),
	);
	const expires_at = Math.floor(DateTime.now().plus({ hour: 1 }).toSeconds());
	const refresh_token = encodeHexLowerCase(
		sha256(new TextEncoder().encode(generate_session_token())),
	);

	await locals.db
		.updateTable("Session")
		.where("id", "=", session.id)
		.set({
			access_token: access_token,
			access_token_expires_at: expires_at,
			refresh_token: refresh_token,
		})
		.execute();

	return json({
		id: session.id,
		accessToken: access_token,
		refreshToken: refresh_token,
		expire: Math.floor(
			Interval.fromDateTimes(
				DateTime.now(),
				DateTime.fromSeconds(expires_at),
			).length("seconds"),
		),
	});
}
