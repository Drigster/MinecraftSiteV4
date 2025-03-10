import { Kysely, type RawBuilder, sql } from "kysely";
import type { DB } from "./schema";
import { dev } from "$app/environment";
import { TURSO_TOKEN, TURSO_URL } from "$env/static/private";
import { createClient } from "@libsql/client";
import { LibsqlDialect } from "kysely-libsql";

if (!TURSO_URL || !TURSO_TOKEN) {
	if (dev) {
		throw new Error("TURSO_URL and TURSO_TOKEN must be set");
	} else {
		console.warn("TURSO_URL and TURSO_TOKEN must be set");
	}
}

let _dbClient;
let _db;

try {
	_dbClient = createClient({
		url: TURSO_URL,
		authToken: TURSO_TOKEN,
	});

	_db = new Kysely<DB>({
		dialect: new LibsqlDialect({ client: _dbClient }),
	});
} catch (e) {
	console.error("DB ERROR: " + e);
}

if (_dbClient === undefined || _db === undefined) {
	throw new Error("DB ERROR: Failed to initialize database");
}

export const dbClient = _dbClient;
export const db = _db;
export function json<T>(obj: T): RawBuilder<T> {
	return sql`${JSON.stringify(obj)}`;
}
