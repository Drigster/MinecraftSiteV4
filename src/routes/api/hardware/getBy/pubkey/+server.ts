import { API_BEARER } from "$env/static/private";
import { createLauncherUserHardware } from "$lib/server/api_utils";
import { json, text } from "@sveltejs/kit";

type Request = {
	publicKey: string;
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
	if (requestData.publicKey == undefined) {
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
		.where("public_key", "=", requestData.publicKey)
		.executeTakeFirst();

	if (hardware == null) {
		return text("No Content", {
			status: 204,
		});
	}

	return json(createLauncherUserHardware(hardware));
}
