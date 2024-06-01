import db from "$lib/db.js";

interface Request {
	username: string;
	uuid: string;
	accessToken: string;
	serverId: string;
}

export async function POST({ request }) {
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

		return new Response(JSON.stringify(error), {
			headers: {
				"Content-Type": "application/json",
			},
			status: error.code,
		});
	}

	const session = await db.session.findUnique({
		where: {
			user: {
				username: {
					equals: requestData.username,
					mode: "insensitive",
				}
			},
			token: requestData.accessToken,
		},
		include: {
			user: true,
		},
	});

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

	await db.session.update({
		where: {
			id: session.id,
		},
		data: {
			serverId: requestData.serverId,
		},
	});

	const error = {
		message: "OK",
		code: 200,
	};

	return new Response(JSON.stringify(error), {
		headers: {
			"Content-Type": "application/json",
		},
		status: error.code,
	});
}
