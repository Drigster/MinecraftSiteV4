import fs from "fs";
import defaultHead from "$lib/assets/default_head.png?hex";

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
		fs.existsSync("./files/skins/" + user.skin_digest + "_head.png")
	) {
		skin = fs.readFileSync(
			"./files/skins/" + user.skin_digest + "_head.png",
		);
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
