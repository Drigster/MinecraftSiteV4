import fs from "fs";
import defaultBody from "$lib/assets/default_body.png?hex";

export async function GET({ params, locals }) {
	params.user = params.user.replace(".png", "");

	const user = await locals.db
		.selectFrom("User")
		.select("skin_digest")
		.where((eb) =>
			eb.or([
				eb("username", "=", params.user),
				eb("uuid", "=", params.user),
			]),
		)
		.executeTakeFirst();

	let skin;

	if (
		user?.skin_digest &&
		fs.existsSync("./files/skins/" + user.skin_digest + "_body.png")
	) {
		skin = fs.readFileSync(
			"./files/skins/" + user.skin_digest + "_body.png",
		);
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
