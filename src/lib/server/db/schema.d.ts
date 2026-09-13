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
export type Hardware = {
	/**
	 * @kyselyType(`h_${string}`)
	 */
	id: `h_${string}`;
	public_key: string;
	hw_disk_id: string;
	baseboard_serial_number: string | null;
	display_ids: string | null;
	bitness: number;
	total_memory: number;
	logical_processors: number;
	physical_processors: number;
	processor_max_freq: number;
	/**
	 * @kyselyType(boolean)
	 */
	battery: boolean;
	oem_id: string | null;
	/**
	 * @kyselyType(boolean)
	 */
	banned: Generated<boolean>;
	internal_ban_reason: string | null;
};
export type HardwareToUser = {
	A: string;
	B: string;
};
export type Session = {
	id: string;
	expires_at: number;
	refresh_token: string | null;
	access_token: string | null;
	access_token_expires_at: number | null;
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
	banned: Generated<number>;
	internal_ban_reason: string | null;
	skin_digest: string | null;
	/**
	 * @kyselyType(boolean)
	 */
	skin_is_slim: Generated<boolean>;
	cape_digest: string | null;
};
export type DB = {
	_HardwareToUser: HardwareToUser;
	ChangeEmailRequest: ChangeEmailRequest;
	Hardware: Hardware;
	Session: Session;
	User: User;
};
