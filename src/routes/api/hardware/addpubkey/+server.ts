import { API_BEARER } from "$env/static/private";
import { json } from "@sveltejs/kit";

type Request = {
	hardware: {
		id: `h_${string}`;
	};
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
	if (
		requestData.hardware?.id == undefined ||
		requestData.publicKey == undefined
	) {
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
		.updateTable("Hardware")
		.set({
			public_key: requestData.publicKey,
		})
		.execute();

	return json(
		{
			message: "success",
		},
		{
			status: 200,
		},
	);
}
