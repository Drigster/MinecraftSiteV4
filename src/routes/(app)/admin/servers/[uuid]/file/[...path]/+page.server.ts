import { error } from "@sveltejs/kit";

export const load = async ({ params, locals, parent }) => {
	if (locals.user?.role != "ADMIN") {
		return error(404, "Not found");
	}

    const server = (await parent()).server;

	params.path = params.path.replaceAll("+", "%2B");

	let response: Response;
	try {
		response = await fetch(
			`http://${server.localIp}:${server.localPort}/file/${params.path}`,
		);
	} catch (err) {
		console.log(err);
		return error(
			503,
			"Launcher manager seems to be down,\nplease contact the administrator!",
		);
	}

	if (response.status != 200) {
		return error(
			response.status,
			await response.text()
		)
	}
	
	const contentDisposition = response.headers.get("Content-Disposition");
	let filename = "unknown";

	if (contentDisposition) {
		const match = contentDisposition.match(/filename="(.+)"/);
		if (match && match[1]) {
			filename = match[1];
		}
	}

	const buffer = response.arrayBuffer();

	return { buffer: buffer, filename: filename };
};
