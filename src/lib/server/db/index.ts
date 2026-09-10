import { Kysely, type RawBuilder, sql } from "kysely";
import { LibsqlDialect } from "kysely-libsql";
import type { DB } from "./schema";
import { dev } from "$app/environment";
import { TURSO_TOKEN, TURSO_URL } from "$env/static/private";
import { createClient } from "@libsql/client";

if (!TURSO_URL || !TURSO_TOKEN) {
	if (dev) {
		throw new Error("TURSO_URL and TURSO_TOKEN must be set");
	} else {
		console.warn("TURSO_URL and TURSO_TOKEN must be set");
	}
}

const dbClient = createClient({
	url: TURSO_URL,
	authToken: TURSO_TOKEN,
});

export function init_db(): Kysely<DB> {
	return new Kysely<DB>({
		dialect: new LibsqlDialect({ client: dbClient }),
	});
}

export function json<T>(obj: T): RawBuilder<T> {
	return sql`${JSON.stringify(obj)}`;
}
