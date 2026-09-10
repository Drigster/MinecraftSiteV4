import { init_db } from "./db";

const db = init_db();

export async function cleanupOldSessions() {
	const oneMonthAgo = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30;

	let totalDeleted = 0;
	let deletedInBatch: number;

	do {
		const result = await db
			.deleteFrom("Session")
			.where("expires_at", "<", oneMonthAgo)
			.limit(1000)
			.executeTakeFirst();

		deletedInBatch = Number(result?.numDeletedRows ?? 0);
		totalDeleted += deletedInBatch;
	} while (deletedInBatch > 0);

	console.log(`[session-cleanup] Deleted ${totalDeleted} old sessions`);
	return totalDeleted;
}
