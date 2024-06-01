import db from "$lib/db.js";
import { json } from "@sveltejs/kit";
import { createHash } from "crypto";
import fs from "fs";
import { DateTime, Interval } from "luxon";

interface Request {
	accessToken: string;
}

export async function POST({ request }) {
	const requestData: Request = await request.json();
	if (requestData.accessToken == undefined) {
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

	let session = await db.session.findUnique({
		where: {
			token: requestData.accessToken,
			expiresAt: {
				gt: new Date(),
			},
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

	session = await db.session.update({
		where: {
			id: session.id,
		},
		data: {
			expiresAt: DateTime.now().plus({ week: 1 }).toJSDate(),
		},
		include: {
			user: true,
		},
	});

	await db.session.deleteMany({
		where: {
			userId: session.user.id,
			expiresAt: {
				lte: new Date(),
			},
		},
	});

	const skinUrl = "https://" + request.headers.get("host") + "/api/skin/" + session.user.username;
	let skin;
	if (
		session.user !== null &&
		fs.existsSync("./files/skins/" + session.user.id.toString() + ".png")
	) {
		skin = fs.readFileSync("./files/skins/" + session.user.id.toString() + ".png");
	} else {
		skin = fs.readFileSync("./files/default.png");
	}

	const user: User = {
		username: session.user.username,
		uuid: session.user.uuid,
		permissions: session.user.permissions,
		roles: [session.user.role],
		assets: {
			SKIN: {
				url: skinUrl,
				digest: createHash("sha256").update(skin).digest("hex"),
			},
		},
	};

	const userSession: UserSession = {
		id: session.id,
		accessToken: session.token,
		refreshToken: session.refreshToken,
		expire: Math.floor(
			Interval.fromDateTimes(DateTime.now(), session.expiresAt).length("seconds"),
		),
		user: user,
	};

	return json(userSession);
}
