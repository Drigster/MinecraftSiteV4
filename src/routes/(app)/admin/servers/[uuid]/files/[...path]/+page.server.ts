import { error } from "@sveltejs/kit";
import { fail, message, superValidate } from "sveltekit-superforms";
import { uploadFileSchema } from "$lib/components/FileBrowser/schema";
import { zod } from "sveltekit-superforms/adapters";
import type { FileType } from "$lib/apiTypes";

export const load = async ({ params, locals, parent }) => {
	if (locals.user?.role != "ADMIN") {
		return error(404, "Not found");
	}

    const server = (await parent()).server;

	let response: Response;
	try {
		response = await fetch(
			`http://${server.localIp}:${server.localPort}/files/${params.path}`,
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

	const files: FileType[] = await response.json();

	console.log("load");

	// const uploadFileForm = await superValidate(zod(uploadFileSchema));

	return { files };
};

// export const actions = {
// 	upload: async ({ params, request }) => {
// 		const form = await superValidate(request, zod(uploadFileSchema));

// 		if (!form.valid) {
// 			return fail(400, { form });
// 		}

// 		await fetch(
// 			`http://localhost:3000/api/updates/${params.uuid}/file/upload/`,
// 			{
// 				method: "POST",
// 				body: form,
// 			},
// 		);

// 		return message(form, {
// 			type: "success",
// 			text: "File uploaded successfully",
// 		});
// 	},
// };
