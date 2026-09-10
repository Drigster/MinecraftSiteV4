declare global {
	namespace App {
		// interface Platform {}

		interface Locals {
			db: import("kysely").Kysely<import("$lib/server/db/schema").DB>;
			user: import("$lib/server/auth").User | null;
			session: import("$lib/server/auth").Session | null;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}

		declare module "*?hex" {
			const content: string;
			export default content;
		}
	}
}

export {};
