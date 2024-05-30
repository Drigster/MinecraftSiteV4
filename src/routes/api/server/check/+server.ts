import db from "$lib/db.js";

interface Request {
	username: string;
	serverId: string;
}

export async function POST({ request }) {
	const requestData: Request = await request.json();
	if (requestData.username == undefined || requestData.serverId == undefined) {
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

	const session = await db.session.findFirst({
		where: {
			user: {
				username: {
					equals: requestData.username,
					mode: "insensitive",
				},
			},
			serverId: requestData.serverId,
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

	return new Response("OK", { status: 200 });
}
