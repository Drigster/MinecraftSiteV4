import { error, redirect } from "@sveltejs/kit";
import { form, getRequestEvent } from "$app/server";
import {
	deleteCape,
	deleteSkin,
	saveCape,
	saveSkin,
} from "$lib/server/skin_utils";
import { uploadCapeSchema, uploadSkinSchema } from "./server/schemas";
import type { Kysely } from "kysely";
import type { DB } from "./server/db/schema";

export const removeSkin = form(async () => {
	const { locals } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	} else if (!locals.user.verified) {
		redirect(303, "/notverified");
	}

	const user = await locals.db
		.selectFrom("User")
		.select(["id", "skin_digest"])
		.where("id", "=", locals.user.id)
		.executeTakeFirstOrThrow();

	if (user.skin_digest) {
		await tryDeleteSkin(user.skin_digest, locals.db, user.id);

		await locals.db
			.updateTable("User")
			.where("id", "=", user.id)
			.set({
				skin_digest: null,
			})
			.execute();
	}

	redirect(303, "/profile");
});

export const removeCape = form(async () => {
	const { locals } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	} else if (!locals.user.verified) {
		redirect(303, "/notverified");
	}

	const user = await locals.db
		.selectFrom("User")
		.select(["id", "cape_digest"])
		.where("id", "=", locals.user.id)
		.executeTakeFirstOrThrow();

	if (user.cape_digest) {
		await tryDeleteCape(user.cape_digest, locals.db, user.id);

		await locals.db
			.updateTable("User")
			.where("id", "=", user.id)
			.set({
				cape_digest: null,
			})
			.execute();
	}

	redirect(303, "/profile");
});

export const uploadSkin = form(uploadSkinSchema, async (data) => {
	const { locals } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	} else if (!locals.user.verified) {
		redirect(303, "/notverified");
	}

	const user = await locals.db
		.selectFrom("User")
		.select(["id", "skin_digest"])
		.where("id", "=", locals.user.id)
		.executeTakeFirstOrThrow();

	const { digest, isSlim } = await saveSkin(data.skin);

	if (user.skin_digest) {
		await tryDeleteSkin(user.skin_digest, locals.db, user.id);
	}

	await locals.db
		.updateTable("User")
		.where("id", "=", locals.user.id)
		.set({
			skin_digest: digest,
			skin_is_slim: isSlim,
		})
		.execute();

	redirect(303, "/profile");
});

export const uploadCape = form(uploadCapeSchema, async (data) => {
	const { locals } = getRequestEvent();

	if (locals.user == null) {
		redirect(303, "/login");
	} else if (!locals.user.verified) {
		redirect(303, "/notverified");
	} else if (locals.user.role != "ADMIN") {
		return error(404);
	}

	const user = await locals.db
		.selectFrom("User")
		.select(["id", "cape_digest"])
		.where("id", "=", locals.user.id)
		.executeTakeFirstOrThrow();

	const digest = await saveCape(data.cape);

	if (user.cape_digest) {
		await tryDeleteCape(user.cape_digest, locals.db, user.id);
	}

	await locals.db
		.updateTable("User")
		.where("id", "=", locals.user.id)
		.set({
			cape_digest: digest,
		})
		.execute();

	redirect(303, "/profile");
});

const tryDeleteSkin = async (
	digest: string,
	db: Kysely<DB>,
	user_id: `u_${string}`,
) => {
	const other_users = await db
		.selectFrom("User")
		.select(["id"])
		.where("skin_digest", "=", digest)
		.where("id", "!=", user_id)
		.execute();

	if (other_users.length == 0) {
		deleteSkin(digest);
	}
};

const tryDeleteCape = async (
	digest: string,
	db: Kysely<DB>,
	user_id: `u_${string}`,
) => {
	const other_users = await db
		.selectFrom("User")
		.select(["id"])
		.where("cape_digest", "=", digest)
		.where("id", "!=", user_id)
		.execute();

	if (other_users.length == 0) {
		deleteCape(digest);
	}
};
