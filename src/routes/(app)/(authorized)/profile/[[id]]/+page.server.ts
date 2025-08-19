import { db } from "$lib/db";
import { error } from "@sveltejs/kit";
import type { Selectable } from "kysely";
import type { DB } from "$lib/db/schema";

export const load = async ({ locals, params }) => {
	let user: Selectable<DB["User"]>;
	let sessions: Selectable<DB["Session"]>[];

	if (params.id != undefined) {
		if (locals.user?.role != "ADMIN") {
			return error(404, "Not found");
		}

		const dbUser = await db
			.selectFrom("User")
			.selectAll()
			.where("id", "=", params.id)
			.executeTakeFirst();

		if (dbUser == undefined) {
			return error(404, "Not found");
		}
		user = dbUser;

		sessions = await db
			.selectFrom("Session")
			.selectAll()
			.where("user_id", "=", user!.id)
			.orderBy("last_login", "desc")
			.execute();
	} else {
		user = await db
			.selectFrom("User")
			.selectAll()
			.where("id", "=", locals.user!.id)
			.executeTakeFirstOrThrow();

		sessions = await db
			.selectFrom("Session")
			.selectAll()
			.where("user_id", "=", locals.user!.id)
			.orderBy("last_login", "desc")
			.execute();
	}

	let isSelf;
	if (params.id == undefined) {
		isSelf = true;
	} else {
		isSelf = params.id == locals.user!.id;
	}

	return {
		user,
		sessions,
		currentSession: locals.session!,
		isSelf,
		userRole: locals.user?.role,
	};
};