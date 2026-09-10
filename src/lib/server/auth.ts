import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase,
} from "@oslojs/encoding";
import { generateRandomIntegerNumber } from "@oslojs/crypto/random";
import { sha256 } from "@oslojs/crypto/sha2";
import { getRequestEvent } from "$app/server";
import { error } from "@sveltejs/kit";
import DeviceDetector from "device-detector-js";
import geoip from "geoip-lite";
import type { DB } from "$lib/server/db/schema";

import type { RandomReader } from "@oslojs/crypto/random";

const random: RandomReader = {
	read(bytes) {
		crypto.getRandomValues(bytes as Uint8Array<ArrayBuffer>);
	},
};

const ONE_DAY = 1000 * 60 * 60 * 24;

export function generate_session_token(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function create_session(
	token: string,
	user_id: `u_${string}`,
	metadata: {
		ip: string;
		user_agent: string | null;
	},
): Promise<Session> {
	const { locals } = getRequestEvent();
	const session_id = encodeHexLowerCase(
		sha256(new TextEncoder().encode(token)),
	);
	const session: Session = {
		id: session_id,
		user_id,
		expires_at: new Date(Date.now() + ONE_DAY * 60),
	};

	if (metadata.ip.startsWith("::ffff:")) {
		metadata.ip = metadata.ip.slice(7);
	}

	let device: string | null = null;
	if (metadata.user_agent != null) {
		const deviceDetector = new DeviceDetector();
		const parsed = deviceDetector.parse(metadata.user_agent);
		device = `${parsed.os?.name} ${parsed.os?.version} - ${parsed.client?.name} ${parsed.client?.version}`;
	}

	let location: string | null = null;
	if (metadata.ip != null) {
		const city = geoip.lookup(metadata.ip);
		if (city != null) {
			location = `${city.country}${city.city != "" ? `, ${city.city}` : ""}`;
		}
	}

	await locals.db
		.insertInto("Session")
		.values({
			id: session.id,
			user_id: session.user_id,
			expires_at: Math.floor(session.expires_at.getTime() / 1000),
			device: device,
			location: location,
			ip: metadata.ip,
			type: "SITE",
			last_login: new Date().toISOString(),
		})
		.execute();
	return session;
}

export async function validate_session_token(
	token: string,
	metadata: {
		ip: string;
		user_agent: string | null;
	},
): Promise<SessionValidationResult> {
	const { locals } = getRequestEvent();
	const session_id = encodeHexLowerCase(
		sha256(new TextEncoder().encode(token)),
	);
	const row = await locals.db
		.selectFrom("Session as s")
		.innerJoin("User as u", "u.id", "s.user_id")
		.select([
			"s.id",
			"s.expires_at",
			"u.id as user_id",
			"u.username",
			"u.role",
			"u.verified",
		])
		.where("s.id", "=", session_id)
		.executeTakeFirst();
	if (!row) {
		return { session: null, user: null };
	}
	const session: Session = {
		id: row.id,
		user_id: row.user_id,
		expires_at: new Date(row.expires_at * 1000),
	};
	if (Date.now() >= session.expires_at.getTime()) {
		await locals.db
			.deleteFrom("Session")
			.where("id", "=", session.id)
			.execute();
		return { session: null, user: null };
	}
	const user: User = {
		id: row.user_id,
		username: row.username,
		role: row.role,
		verified: row.verified,
	};

	if (metadata.ip.startsWith("::ffff:")) {
		metadata.ip = metadata.ip.slice(7);
	}

	let device: string | null = null;
	if (metadata.user_agent != null) {
		const deviceDetector = new DeviceDetector();
		const parsed = deviceDetector.parse(metadata.user_agent);
		device = `${parsed.os?.name} ${parsed.os?.version} - ${parsed.client?.name} ${parsed.client?.version}`;
	}

	let location: string | null = null;
	if (metadata.ip != null) {
		const city = geoip.lookup(metadata.ip);
		if (city != null) {
			location = `${city.country}${city.city != "" ? `, ${city.city}` : ""}`;
		}
	}

	let expires_at = undefined;

	if (Date.now() >= session.expires_at.getTime() - ONE_DAY * 15) {
		expires_at = new Date(Date.now() + ONE_DAY * 30);
	}
	await locals.db
		.updateTable("Session")
		.set({
			expires_at: expires_at
				? Math.floor(session.expires_at.getTime() / 1000)
				: undefined,
			device: device,
			location: location,
			ip: metadata.ip,
			last_login: new Date().toISOString(),
		})
		.where("id", "=", session.id)
		.execute();
	return { session, user };
}

export async function invalidate_session(session_id: string): Promise<void> {
	const { locals } = getRequestEvent();
	await locals.db
		.deleteFrom("Session")
		.where("id", "=", session_id)
		.execute();
}

export type SessionValidationResult =
	{ session: Session; user: User } | { session: null; user: null };

export interface Session {
	id: string;
	user_id: `u_${string}`;
	expires_at: Date;
}

export type User = {
	id: `u_${string}`;
	username: string;
	role: DB["User"]["role"]["__select__"];
	verified: boolean;
};

export function check_auth() {
	const { locals } = getRequestEvent();
	if (!locals.user) error(401, "Unauthorized");
}

export function generateOneTimeCode(): string {
	let code: string;
	do {
		code = (
			generateRandomIntegerNumber(random, 900000) + 100000
		).toString();
	} while (/(.)\1\1/.test(code));
	return code;
}
