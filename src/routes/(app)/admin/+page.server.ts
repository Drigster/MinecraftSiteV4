import { superValidate } from "sveltekit-superforms";
import { error, fail, redirect } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";

const schema = z.object({
	username: z.string(),
	password: z.string(),
});

export const load = async ({ parent }) => {
	if ((await parent()).user?.role != "ADMIN") {
		return error(404, "Not Found");
	}

	const form = await superValidate(zod(schema));

	// Always return { form } in load functions
	return { form };
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			// Again, return { form } and things will just work.
			return fail(400, { form });
		}

		// TODO: Do something with the validated form.data

		// Display a success status message
		return redirect(300, "/admin/dashboard");
	},
};
