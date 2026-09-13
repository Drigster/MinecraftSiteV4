import { API_BEARER } from "$env/static/private";
import { createLauncherUserHardware } from "$lib/server/api_utils";
import { json } from "@sveltejs/kit";

type Request = {
	id: `h_${string}`;
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
	if (requestData.id == undefined) {
		const error = {
			error: "Bad Request",
			code: 400,
		};

		return json(error, {
			status: error.code,
		});
	}

	const hardware = await locals.db
		.selectFrom("Hardware")
		.selectAll()
		.where("id", "=", requestData.id)
		.executeTakeFirst();

	if (hardware == null) {
		if (hardware == null) {
			const error = {
				error: "No Content",
				code: 404,
			};

			return json(error, { status: 404 });
		}
	}

	return json(createLauncherUserHardware(hardware));
}
