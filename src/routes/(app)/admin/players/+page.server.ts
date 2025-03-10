import { db } from "$lib/db";

export const load = async () => {
	const users = await db.selectFrom("User").selectAll().execute();

	return {
		users,
	};
};
