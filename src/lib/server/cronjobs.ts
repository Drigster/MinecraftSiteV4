import cron from "node-cron";
import { cleanupOldSessions } from "./session_cleanup";

let started = false;

export function initCronJobs() {
	if (started) return; // guard against double-init in dev HMR
	started = true;

	// Run at 3:00 AM every day
	cron.schedule("0 * * * *", async () => {
		console.log("[cron] Running session cleanup...");
		await cleanupOldSessions().catch(console.error);
	});
}
