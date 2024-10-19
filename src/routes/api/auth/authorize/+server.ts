import { db } from "$lib/db";
import {
	createLauncherUserSession,
	createLuciaSession,
} from "$lib/util.server.js";
import { json } from "@sveltejs/kit";
import bcrypt from "bcrypt";

interface Request {
	login: string;
	password: string;
	totpCode?: string;
}

export async function POST({ request }) {
	const requestData: Request = await request.json();
	if (requestData.login == undefined || requestData.password == undefined) {
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

	const user = await db
		.selectFrom("User")
		.selectAll()
		.where("username", "=", requestData.login)
		.executeTakeFirst();

	if (user == undefined) {
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
	} else if (
		!bcrypt.compareSync(requestData.password + user.salt, user.password)
	) {
		const error = {
			error: "Пароль не верен!",
			code: 403,
		};

		return new Response(JSON.stringify(error), {
			headers: {
				"Content-Type": "application/json",
			},
			status: error.code,
		});
	}

	const session = await createLuciaSession(
		request.headers.get("X-Real-IP"),
		user.id,
		request.headers.get("User-Agent")!,
		"LAUNCHER",
	);

	return json(createLauncherUserSession(session, user));
}
