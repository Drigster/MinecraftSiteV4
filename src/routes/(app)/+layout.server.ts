import { getUser } from "$lib/util.server.js";
import { redirect } from "@sveltejs/kit";
import { DateTime } from "luxon";

export const load = async ({ cookies }) => {
	let target = DateTime.now().setLocale("ru").setZone("Europe/Tallinn").set({ year: 2024, month: 6, day: 1, hour: 12, minute: 0, second: 0 });
	if (cookies.get("wip") != "off" && target > DateTime.now()) {
		return redirect(307, "/timer");
	}

	const user = await getUser(cookies.get("sessionToken"));
	if (user !== null) {
		return {
			user: {
				username: user.username,
			},
		};
	}
};
