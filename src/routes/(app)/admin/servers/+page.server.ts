import { db } from "$lib/db";
import { getServers } from "$lib/util.server";

export const load = async () => {
	const servers = await getServers();

	const user_ids = servers.map((server) => server.ownerId);
	const users = await db
		.selectFrom("User")
		.selectAll()
		.where("id", "in", user_ids)
		.execute();

	const serversWithOwners = servers.map((server) => {
		const user = users.find((user) => user.id === server.ownerId);
		return { ...server, owner: user };
	});

	return {
		servers: serversWithOwners,
	};
};
