import { db } from "$lib/db";
import { error } from "@sveltejs/kit";
import { jsonObjectFrom } from "kysely/helpers/sqlite";

export const load = async ({ params }) => {
	const server = await db
		.selectFrom("Server")
		.select((eb) => [
			"Server.uuid",
			"Server.name",
			"Server.codename",
			"Server.description",
			"Server.createdAt",
			"Server.hasLinkAccess",
			"Server.ip",
			"Server.port",
			"Server.localIp",
			"Server.localPort",
			"Server.status",
			"Server.ownerId",
			jsonObjectFrom(
				eb
					.selectFrom("User")
					.selectAll()
					.whereRef("User.id", "=", "Server.ownerId"),
			).as("owner"),
		])
		.where("Server.uuid", "=", params.uuid)
		.executeTakeFirst();

	if (server == undefined) {
		return error(404);
	}

	return {
		server,
	};
};
