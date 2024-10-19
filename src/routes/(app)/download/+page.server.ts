import { redirect } from "@sveltejs/kit";

export const load = async () => {
	return redirect(303, "https://launcher.foxy.town/FoxyTown Launcher.exe");
};
