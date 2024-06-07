import db from "$lib/db.js";
import fs from "fs";
import { json } from "@sveltejs/kit";
import { createHash } from "crypto";
import { ORIGIN } from "$env/static/private";

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

	const skinUrl = ORIGIN + "/api/skin/" + session.user.username;
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

	db.user.update({
		where: {
			id: session.user.id
		},
		data: {
			lastPlayed: new Date()
		}
	})

	return json(user);
}
