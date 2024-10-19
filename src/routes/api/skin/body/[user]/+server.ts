import { db } from "$lib/db";
import fs from "fs";
import defaultBody from "$lib/assets/default_body.png?hex";

export async function GET({ params }) {
	params.user = params.user.replace(".png", "");

	const user = await db
		.selectFrom("User")
		.select("id")
		.where((eb) =>
			eb.or([
				eb("username", "=", params.user),
				eb("uuid", "=", params.user),
			]),
		)
		.executeTakeFirst();

	let skin;

	if (
		user !== undefined &&
		fs.existsSync("./files/skins/" + user.id + "_body.png")
	) {
		skin = fs.readFileSync("./files/skins/" + user.id + "_body.png");
	} else {
		skin = Buffer.from(defaultBody, "hex");
	}

	return new Response(skin, {
		status: 200,
		headers: {
			"Content-type": "image/png",
			//"Content-Disposition": "attachment; filename=" + params.user + ".png",
		},
	});
}
