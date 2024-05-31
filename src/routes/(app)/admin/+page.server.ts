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

	return { form };
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		return redirect(300, "/admin/dashboard");
	},
};
