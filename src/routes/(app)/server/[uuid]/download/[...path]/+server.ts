import { error } from "@sveltejs/kit";

export const GET = async ({ params, locals }) => {
	if (locals.user?.role != "ADMIN") {
		return error(404, "Not found");
	}

	params.path = params.path.replaceAll("+", "%2B");

	let response: Response;
	try {
		response = await fetch(
			`http://localhost:3000/api/updates/${params.uuid}/file/?file=${params.path}`,
		);
	} catch (err) {
		console.log(err);
		return error(
			503,
			"Launcher manager seems to be down,\nplease contact the administrator!",
		);
	}

	if (response.status == 404) {
		return error(404, "File not found");
	}

	const contentDisposition = response.headers.get("Content-Disposition");
	let filename = "unknown";

	if (contentDisposition) {
		const match = contentDisposition.match(/filename="(.+)"/);
		if (match && match[1]) {
			filename = match[1];
		}
	}

	const buffer = await response.arrayBuffer();

	return new Response(buffer, {
		status: 200,
		headers: {
			"Content-Type":
				response.headers.get("Content-Type") ||
				"application/octet-stream",
			"Content-Disposition": `attachment; filename="${filename}"`,
		},
	});
};
