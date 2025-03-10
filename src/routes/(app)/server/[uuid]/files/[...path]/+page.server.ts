import { error } from "@sveltejs/kit";

export const load = async ({ params, locals }) => {
	if (locals.user?.role != "ADMIN") {
		return error(404, "Not found");
	}

	let response: Response;
	try {
		response = await fetch(
			`http://localhost:3000/api/updates/${params.uuid}/get/`,
		);
	} catch (err) {
		console.log(err);
		return error(
			503,
			"Launcher manager seems to be down,\nplease contact the administrator!",
		);
	}

	const files = await response.json();

	if (files["error"] != undefined) {
		return error(files["code"], files["error"]);
	}

	return { files };
};
