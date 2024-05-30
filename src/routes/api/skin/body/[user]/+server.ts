import db from "$lib/db.js";
import fs from "fs";

export async function GET({ params }) {
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

	let skin;

	if (user !== null && fs.existsSync("./files/skins/" + user.id.toString() + "_body.png")) {
		skin = fs.readFileSync("./files/skins/" + user.id.toString() + "_body.png");
	} else {
		skin = fs.readFileSync("./files/default_body.png");
	}

	return new Response(skin, {
		status: 200,
		headers: {
			"Content-type": "image/png",
			//"Content-Disposition": "attachment; filename=" + params.user + ".png",
		},
	});
}
