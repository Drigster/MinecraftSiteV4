import { db } from "$lib/db";

export const load = async ({ locals }) => {
	const users = await db
		.selectFrom("User")
		.select((eb) => eb.fn.countAll().as("num_rows"))
		.executeTakeFirst();

	const servers = await db
		.selectFrom("Server")
		.select((eb) => eb.fn.countAll().as("num_rows"))
		.executeTakeFirst();

	return {
		users_count: users!.num_rows as number,
		servers_count: servers!.num_rows as number,
	};
};
