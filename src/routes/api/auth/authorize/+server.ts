import { createLauncherUserSession } from "$lib/server/api_utils";
import { create_session, generate_session_token } from "$lib/server/auth";
import { json } from "@sveltejs/kit";
import bcrypt from "bcryptjs";

interface Request {
	login: string;
	password: string;
	totpCode?: string;
}

export async function POST({ request, locals, getClientAddress }) {
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

	const user = await locals.db
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
	} else if (!bcrypt.compareSync(requestData.password, user.password)) {
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

	const token = generate_session_token();
	const session = await create_session(token, user.id, {
		ip: getClientAddress(),
		user_agent: request.headers.get("User-Agent") || null,
	});

	return json(await createLauncherUserSession(token, session, user));
}
