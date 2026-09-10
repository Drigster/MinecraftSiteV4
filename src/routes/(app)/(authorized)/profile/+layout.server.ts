export const load = async ({ locals }) => {
	const user = await locals.db
		.selectFrom("User")
		.selectAll()
		.where("id", "=", locals.user!.id)
		.executeTakeFirstOrThrow();

	const sessions = await locals.db
		.selectFrom("Session")
		.selectAll()
		// .where("user_id", "=", locals.user!.id)
		.orderBy("last_login", "desc")
		.execute();

	const current_session_id = locals.session!.id;

	return {
		user,
		sessions,
		current_session_id,
	};
};
