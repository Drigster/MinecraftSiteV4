import fs from "fs";
import sanitize from "sanitize-filename";

export async function GET({ params, locals }) {
	const slug = sanitize(params.slug.replace(".png", ""));
	let cape;

	if (fs.existsSync("./files/capes/" + slug + ".png")) {
		cape = fs.readFileSync("./files/capes/" + slug + ".png");
	} else {
		const user = await locals.db
			.selectFrom("User")
			.select("cape_digest")
			.where((eb) =>
				eb.or([eb("username", "=", slug), eb("uuid", "=", slug)]),
			)
			.executeTakeFirst();

		if (
			user?.cape_digest &&
			fs.existsSync("./files/capes/" + user.cape_digest + ".png")
		) {
			cape = fs.readFileSync(
				"./files/capes/" + user.cape_digest + ".png",
			);
		} else {
			return new Response("Cape not found", {
				status: 404,
			});
		}
	}

	return new Response(cape, {
		status: 200,
		headers: {
			"Content-type": "image/png",
		},
	});
}
