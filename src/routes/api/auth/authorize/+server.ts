import { ORIGIN } from "$env/static/private";
import db from "$lib/db.js";
import { generateToken } from "$lib/util.server";
import { json } from "@sveltejs/kit";
import bcrypt from "bcrypt";
import { createHash } from "crypto";
import fs from "fs";
import { DateTime } from "luxon";

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

	const user = await db.user.findFirst({
		where: {
			username: {
				equals: requestData.login,
				mode: "insensitive",
			},
		},
	});

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
	} else if (!bcrypt.compareSync(requestData.password + user.uuid, user.password)) {
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

	const skinUrl = ORIGIN + "/api/skin/" + user.username;
	let skin;
	if (user !== null && fs.existsSync("./files/skins/" + user.id.toString() + ".png")) {
		skin = fs.readFileSync("./files/skins/" + user.id.toString() + ".png");
	} else {
		skin = fs.readFileSync("./files/skins/default.png");
	}

	const userObj: User = {
		username: user.username,
		uuid: user.uuid,
		permissions: user.permissions,
		roles: [user.role],
		assets: {
			SKIN: {
				url: skinUrl,
				digest: createHash("sha256").update(skin).digest("hex"),
			},
		},
	};

	await db.session.deleteMany({
		where: {
			userId: user.id,
			expiresAt: {
				lte: new Date(),
			},
		},
	});

	const session = await db.session.create({
		data: {
			token: generateToken(),
			refreshToken: generateToken(),
			expiresAt: DateTime.now().plus({ week: 1 }).toJSDate(),
			userId: user.id,
			name: "Launcher",
			ip: "",
		},
	});

	const userSession: UserSession = {
		id: session.id,
		accessToken: session.token,
		refreshToken: session.refreshToken,
		expire: 1, //Math.floor(Interval.fromDateTimes(DateTime.now(), session.expiresAt).length("seconds")),
		user: userObj,
	};

	return json(userSession);
}
