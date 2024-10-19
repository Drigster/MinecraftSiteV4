import { db } from "$lib/db";
import fs from "fs";
import defaultHead from "$lib/assets/default_head.png?hex";

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

	fs.mkdirSync("./files/skins/", { recursive: true });
	if (
		user !== undefined &&
		fs.existsSync("./files/skins/" + user.id + "_head.png")
	) {
		skin = fs.readFileSync("./files/skins/" + user.id + "_head.png");
	} else {
		skin = Buffer.from(defaultHead, "hex");
	}

	return new Response(skin, {
		status: 200,
		headers: {
			"Content-type": "image/png",
			//"Content-Disposition": "attachment; filename=" + params.user + ".png",
		},
	});
}
