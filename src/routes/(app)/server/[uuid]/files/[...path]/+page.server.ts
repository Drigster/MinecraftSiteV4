import { error } from "@sveltejs/kit";
import { fail, message, superValidate } from "sveltekit-superforms";
import { uploadFileSchema } from "$lib/components/FileBrowser/schema";
import { zod } from "sveltekit-superforms/adapters";

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

	const uploadFileForm = await superValidate(zod(uploadFileSchema));

	return { files, uploadFileForm };
};

export const actions = {
	upload: async ({ params, request }) => {
		const form = await superValidate(request, zod(uploadFileSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		await fetch(
			`http://localhost:3000/api/updates/${params.uuid}/file/upload/`,
			{
				method: "POST",
				body: form,
			},
		);

		return message(form, {
			type: "success",
			text: "File uploaded successfully",
		});
	},
};
