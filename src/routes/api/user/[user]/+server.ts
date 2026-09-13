import { API_BEARER } from "$env/static/private";
import { createLauncherUser } from "$lib/server/api_utils";
import { json } from "@sveltejs/kit";

export async function GET({ request, params, locals }) {
	if (request.headers.get("Authorization") !== `Bearer ${API_BEARER}`) {
		const error = {
			error: "Unauthorized",
			code: 401,
		};

		return json(error, {
			status: error.code,
		});
	}

	const user = await locals.db
		.selectFrom("User")
		.selectAll()
		.where((eb) =>
			eb.or([
				eb("username", "=", params.user),
				eb("uuid", "=", params.user),
			]),
		)
		.executeTakeFirst();

	if (user == null) {
		const error = {
			error: "Пользователь не найден!",
			code: 404,
		};

		return json(error, {
			status: error.code,
		});
	}

	return json(createLauncherUser(user));
}
