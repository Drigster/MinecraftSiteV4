import db from "$lib/db.js";
import { json } from "@sveltejs/kit";
import fs from "fs";
import { createHash } from "crypto";

export async function GET({ params, request }) {
	params.user = params.user.replace(".png", "");
	const user = await db.user.findFirst({
		where: {
			OR: [
				{
					username: {
						equals: params.user,
						mode: "insensitive",
					},
				},
				{
					uuid: params.user,
				},
			],
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
	}

	const skinUrl = "https://" + request.headers.get("host") + "/api/skin/" + user.username;
	let skin;
	if (fs.existsSync("./files/skins/" + user.id.toString() + ".png")) {
		skin = fs.readFileSync("./files/skins/" + user.id.toString() + ".png");
	} else {
		skin = fs.readFileSync("./files/default.png");
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

	return json(userObj);
}
