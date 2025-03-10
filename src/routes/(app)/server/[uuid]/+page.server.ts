import { db } from "$lib/db";
import { error } from "@sveltejs/kit";

export const load = async ({ locals, params }) => {
	const server = await db
		.selectFrom("Server")
		.selectAll()
		.where("uuid", "=", params.uuid)
		.executeTakeFirstOrThrow();

	const privelegedUser =
		locals.user?.role == "ADMIN" || locals.user?.id == server.ownerId;
	const permitedUsers = await db
		.selectFrom("User")
		.select("User.id")
		.innerJoin("_ServerUser", "A", "User.id")
		.innerJoin("Server", "B", "Server.id")
		.where("Server.id", "=", server.id)
		.execute();

	if (
		!privelegedUser &&
		server.status != "ACTIVE" &&
		!permitedUsers.some((user) => user.id === locals.user?.id)
	) {
		return error(404, "Not Found");
	}
	const mods = await db
		.selectFrom("ModFile")
		.where("serverId", "=", server.id)
		.innerJoin(
			(eb) => eb.selectFrom("Mod").selectAll().as("mods"),
			(join) => join.onRef("ModFile.mod_id", "=", "mods.id"),
		)
		.selectAll("mods")
		.execute();

	return {
		server,
		mods,
		privelegedUser,
	};
};
