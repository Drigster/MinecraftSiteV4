import { db } from "$lib/db";
import fs from "fs";

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
		fs.existsSync("./files/capes/" + user.id + ".png")
	) {
		skin = fs.readFileSync("./files/capes/" + user.id + ".png");
	} else {
		return new Response("Cape not found", {
			status: 404,
		});
	}

	return new Response(skin, {
		status: 200,
		headers: {
			"Content-type": "image/png",
			//"Content-Disposition": "attachment; filename=" + params.user + ".png",
		},
	});
}
