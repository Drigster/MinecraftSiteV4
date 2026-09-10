import { redirect } from "@sveltejs/kit";
import { form, getRequestEvent } from "$app/server";
import { deleteCape, deleteSkin, saveSkin } from "$lib/server/skin_utils";
import fs from "node:fs";
import { uploadCapeSchema, uploadSkinSchema } from "./server/schemas";

export const removeSkin = form(async () => {
	const { locals } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	} else if (!locals.user.verified) {
		redirect(303, "/notverified");
	}

	deleteSkin(locals.user!.id);

	redirect(303, "/profile");
});

export const removeCape = form(async () => {
	const { locals } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	} else if (!locals.user.verified) {
		redirect(303, "/notverified");
	}

	deleteCape(locals.user!.id);

	redirect(303, "/profile");
});

export const uploadSkin = form(uploadSkinSchema, async (data) => {
	const { locals } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	} else if (!locals.user.verified) {
		redirect(303, "/notverified");
	}

	await saveSkin(data.skin, locals.user!.id);

	redirect(303, "/profile");
});

export const uploadCape = form(uploadCapeSchema, async (data) => {
	const { locals } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	} else if (!locals.user.verified) {
		redirect(303, "/notverified");
	}

	if (!fs.existsSync("./files/capes/")) {
		fs.mkdirSync("./files/capes/", { recursive: true });
	}
	fs.writeFileSync(
		"./files/capes/" + locals.user!.id + ".png",
		Buffer.from(await data.cape.arrayBuffer()),
	);

	redirect(303, "/profile");
});
