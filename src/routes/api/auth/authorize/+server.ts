import { API_BEARER } from "$env/static/private";
import {
	createLauncherUserSession,
	type LauncherError,
} from "$lib/server/api_utils";
import { create_session, generate_session_token } from "$lib/server/auth";
import { json } from "@sveltejs/kit";
import bcrypt from "bcryptjs";

type Request = {
	login: string;
	password: string;
	totpCode?: string;
};

export async function POST({ request, locals, getClientAddress }) {
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
	if (requestData.login == undefined || requestData.password == undefined) {
		const error = {
			error: "Bad Request",
			code: 400,
		};

		return json(error, {
			status: error.code,
		});
	}

	const user = await locals.db
		.selectFrom("User")
		.selectAll()
		.where("username", "=", requestData.login)
		.executeTakeFirst();

	if (user == undefined) {
		const error: LauncherError = {
			error: "auth.usernotfound",
			code: 404,
		};

		return json(error, {
			status: error.code,
		});
	} else if (!bcrypt.compareSync(requestData.password, user.password)) {
		const error: LauncherError = {
			error: "auth.wrongpassword",
			code: 403,
		};

		return json(error, {
			status: error.code,
		});
	} else if (user.verified == false) {
		const error: LauncherError = {
			error: "Пользователь не верифицирован",
			code: 403,
		};

		return json(error, {
			status: error.code,
		});
	}

	const token = generate_session_token();
	const session = await create_session({
		token,
		user_id: user.id,
		type: "LAUNCHER",
		metadata: {
			ip: getClientAddress(),
			user_agent: request.headers.get("User-Agent") || null,
			accessToken: generate_session_token(),
			refreshToken: generate_session_token(),
		},
	});

	return json(await createLauncherUserSession(session, user));
}
