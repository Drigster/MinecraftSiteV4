import { API_BEARER } from "$env/static/private";
import { createLauncherUser } from "$lib/server/api_utils";
import { json } from "@sveltejs/kit";

type Request = {
	hardware: {
		id: `h_${string}`;
	};
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
	if (requestData.hardware?.id == undefined) {
		const error = {
			error: "Bad Request",
			code: 400,
		};

		return json(error, {
			status: error.code,
		});
	}

	const users = await locals.db
		.selectFrom("User")
		.innerJoin("_HardwareToUser", "_HardwareToUser.B", "User.id")
		.selectAll(["User"])
		.where("_HardwareToUser.A", "=", requestData.hardware.id)
		.execute();

	const result = users.map((user) => createLauncherUser(user));

	return json(result, {
		status: 200,
	});
}
