import type { ColumnType } from "kysely";
export type Generated<T> =
	T extends ColumnType<infer S, infer I, infer U>
		? ColumnType<S, I | undefined, U>
		: ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type ChangeEmailRequest = {
	/**
	 * @kyselyType(`cef_${string}`)
	 */
	id: `cef_${string}`;
	new_email: string;
	code_hash: string;
	expires_at: number;
	user_id: string;
};
export type Session = {
	id: string;
	expires_at: number;
	server_id: string | null;
	device: string | null;
	location: string | null;
	ip: string | null;
	/**
	 * @kyselyType("SITE" | "LAUNCHER")
	 */
	type: "SITE" | "LAUNCHER";
	last_login: string;
	/**
	 * @kyselyType(`u_${string}`)
	 */
	user_id: `u_${string}`;
};
export type User = {
	/**
	 * @kyselyType(`u_${string}`)
	 */
	id: `u_${string}`;
	uuid: string;
	username: string;
	email: string;
	password: string;
	/**
	 * @kyselyType(boolean)
	 */
	verified: Generated<boolean>;
	regDate: string;
	/**
	 * @kyselyType('PLAYER' | 'MODERATOR' | 'ADMIN')
	 */
	role: Generated<"PLAYER" | "MODERATOR" | "ADMIN">;
	lastPlayed: string | null;
};
export type DB = {
	ChangeEmailRequest: ChangeEmailRequest;
	Session: Session;
	User: User;
};
