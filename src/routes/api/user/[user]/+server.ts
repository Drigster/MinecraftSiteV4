import { createLauncherUser } from "$lib/server/api_utils";
import { json } from "@sveltejs/kit";

export async function GET({ params, locals }) {
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

		return new Response(JSON.stringify(error), {
			headers: {
				"Content-Type": "application/json",
			},
			status: error.code,
		});
	}

	return json(createLauncherUser(user));
}
