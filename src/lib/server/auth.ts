import type { Selectable } from "kysely";
import { Lucia } from "lucia";
import { LibSQLAdapter } from "@lucia-auth/adapter-sqlite";
import { dev } from "$app/environment";
import type { DB } from "$lib/db/schema";
import { dbClient } from "$lib/db";

const adapter = new LibSQLAdapter(dbClient, {
	user: "User",
	session: "Session",
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev,
		},
	},
	getUserAttributes(db) {
		return {
			username: db.username,
			role: db.role,
			verified: db.verified,
		};
	},
	getSessionAttributes(db) {
		return {
			token: db.token,
			refreshToken: db.refreshToken,
			device: db.device,
			location: db.location,
			type: db.type,
		};
	},
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			username: string;
			role: Selectable<DB["User"]>["role"];
			verified: boolean;
		};
		DatabaseSessionAttributes: {
			token: string;
			refreshToken: string;
			device: string;
			location: string;
			type: Selectable<DB["Session"]>["type"];
		};
	}
}
