import { redirect } from "@sveltejs/kit";
import { DateTime } from "luxon";

export const load = async ({ cookies, locals }) => {
	const target = DateTime.now()
		.setLocale("ru")
		.setZone("Europe/Tallinn")
		.set({ year: 2024, month: 6, day: 1, hour: 12, minute: 0, second: 0 });
	if (cookies.get("wip") != "off" && target > DateTime.now()) {
		return redirect(307, "/timer");
	}

	return { user: locals.user };
};
