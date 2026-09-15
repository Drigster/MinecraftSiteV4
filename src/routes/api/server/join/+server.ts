import type { LauncherError } from "$lib/server/api_utils";
import { json } from "@sveltejs/kit";
import { DateTime } from "luxon";

type Request = {
	username: string;
	uuid: string;
	accessToken: string;
	serverId: string;
};

export async function POST({ request, locals }) {
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
		const error = {
			error: "session not found",
			code: 404,
		};

		return json(error, {
			status: error.code,
		});
	} else if (DateTime.now() >= DateTime.fromSeconds(session.expires_at)) {
		await locals.db
			.deleteFrom("Session")
			.where("id", "=", session.id)
			.execute();

		const error = {
			error: "session not found",
			code: 404,
		};

		return json(error);
	} else if (
		DateTime.now() >= DateTime.fromSeconds(session.access_token_expires_at!)
	) {
		const error: LauncherError = {
			error: "accessToken incorrect",
			code: 403,
		};

		return json(error);
	}

	const user = await locals.db
		.selectFrom("User")
		.select(["username", "uuid"])
		.where("id", "=", session.user_id)
		.executeTakeFirstOrThrow();

	if (user.username != requestData.username) {
		const error: LauncherError = {
			error: "username incorrect",
			code: 403,
		};

		return json(error);
	} else if (requestData.uuid && user.uuid != requestData.uuid) {
		const error: LauncherError = {
			error: "uuid incorrect",
			code: 403,
		};

		return json(error);
	}

	await locals.db
		.updateTable("Session")
		.where("id", "=", session.id)
		.set({
			server_id: requestData.serverId,
		})
		.execute();

	return json(
		{},
		{
			status: 200,
		},
	);
}
