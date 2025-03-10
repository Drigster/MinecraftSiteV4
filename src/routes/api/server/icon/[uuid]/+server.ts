import { db } from "$lib/db";
import fs from "fs";
import defaultServer from "$lib/assets/default_server.png?hex";

export async function GET({ params }) {
	const uuid = params.uuid.replace(".png", "");

	const server = await db
		.selectFrom("User")
		.select("id")
		.where("username", "=", uuid)
		.executeTakeFirst();

	let icon;

	if (
		server !== undefined &&
		fs.existsSync("./files/serverIcons/" + server.id + ".png")
	) {
		icon = fs.readFileSync("./files/serverIcons/" + server.id + ".png");
	} else {
		icon = Buffer.from(defaultServer, "hex");
	}

	return new Response(icon, {
		status: 200,
		headers: {
			"Content-type": "image/png",
			//"Content-Disposition": "attachment; filename=" + params.user + ".png",
		},
	});
}
