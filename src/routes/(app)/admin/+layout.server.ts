import { error } from "@sveltejs/kit";

export const load = async ({ locals }) => {
	if (locals.user?.role != "ADMIN") {
		return error(404, "Not Found");
	}
};
