import fs from "fs";
import defaultBody from "$lib/assets/default_body.png?hex";
import sanitize from "sanitize-filename";

export async function GET({ params, locals }) {
	let slug = sanitize(params.slug.replace(".png", ""));
	let skin;

	if (fs.existsSync("./files/skins/" + slug + "_body.png")) {
		skin = fs.readFileSync("./files/skins/" + slug + "_body.png");
	} else {
		const user = await locals.db
			.selectFrom("User")
			.select("skin_digest")
			.where((eb) =>
				eb.or([eb("username", "=", slug), eb("uuid", "=", slug)]),
			)
			.executeTakeFirst();

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
	}

	return new Response(skin, {
		status: 200,
		headers: {
			"Content-type": "image/png",
		},
	});
}
