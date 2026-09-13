import type { Selectable } from "kysely";
import type { User, Session, DB } from "./db/schema";
import { DateTime, Interval } from "luxon";
import { ORIGIN } from "$env/static/private";

export type LauncherUser = {
	username: string;
	uuid: string;
	permissions: string[];
	roles: string[];
	assets: {
		SKIN: {
			url: string;
			digest: string;
			metadata: {
				model?: "slim";
			};
		};
		CAPE?: {
			url: string;
			digest: string;
			// eslint-disable-next-line @typescript-eslint/no-empty-object-type
			metadata: {};
		};
	};
};

export type LauncherUserSession = {
	id: string;
	accessToken: string;
	refreshToken: string;
	expire: number;
	user: LauncherUser;
	hardwareId?: string;
	userHardware?: LauncherUserHardware;
};

export type LauncherUserHardware = {
	id: string;
	publicKey: string;
	hardwareInfo: LauncherHardwareInfo;
	banned: boolean;
};

export type LauncherHardwareInfo = {
	hwDiskId: string;
	baseboardSerialNumber?: string;
	displayId?: string[];
	bitness: number;
	totalMemory: number;
	logicalProcessors: number;
	physicalProcessors: number;
	processorMaxFreq: number;
	battery: boolean;
	oemId?: string;
};

export type LauncherError = {
	error:
		| (
				| "auth.usernotfound"
				| "auth.wrongpassword"
				| "auth.require2fa"
				| "auth.wrongtotp"
				| "session not found"
				| "accessToken incorrect"
				| "username incorrect"
				| "uuid incorrect"
				| "serverId incorrect"
		  )
		| (string & {});
	/// 1001 - токен истёк (auth.tokenexpired)
	/// 1002 - неверный refresh токен (auth.invalidtoken)
	code?: 1001 | 1002 | number;
};

export function createLauncherUser(user: Selectable<DB["User"]>) {
	const permissions: string[] = [];

	if (user.role == "ADMIN") {
		permissions.push("*");
	}

	let skin;
	if (user.skin_digest) {
		const skinUrl = ORIGIN + "/api/skin/" + user.skin_digest;
		skin = {
			url: skinUrl,
			digest: user.skin_digest,
			metadata: {
				model: user.skin_is_slim ? ("slim" as const) : undefined,
			},
		};
	} else {
		const skinUrl = ORIGIN + "/api/skin/default.png";
		skin = {
			url: skinUrl,
			digest: "default.png",
			metadata: {},
		};
	}

	let cape;
	if (user.cape_digest) {
		const capeUrl = ORIGIN + "/api/cape/" + user.cape_digest;
		cape = {
			url: capeUrl,
			digest: user.cape_digest,
			metadata: {},
		};
	}

	const userData: LauncherUser = {
		username: user.username,
		uuid: user.uuid,
		permissions: permissions,
		roles: [user.role],
		assets: {
			SKIN: skin,
			CAPE: cape,
		},
	};

	return userData;
}

export function createLauncherUserSession(
	session: Session,
	user: Selectable<User>,
) {
	const sessionData: LauncherUserSession = {
		id: session.id,
		accessToken: session.access_token!,
		refreshToken: session.refresh_token!,
		expire: Math.floor(
			Interval.fromDateTimes(
				DateTime.now(),
				DateTime.fromSeconds(session.access_token_expires_at!),
			).length("seconds"),
		),
		user: createLauncherUser(user),
	};

	return sessionData;
}

export function createLauncherUserHardware(
	hardware: Selectable<DB["Hardware"]>,
) {
	const hardware_data: LauncherUserHardware = {
		id: hardware.id,
		publicKey: hardware.public_key,
		hardwareInfo: {
			hwDiskId: hardware.hw_disk_id,
			baseboardSerialNumber:
				hardware.baseboard_serial_number || undefined,
			displayId: hardware.display_ids?.split(";"),
			bitness: hardware.bitness,
			totalMemory: hardware.total_memory,
			logicalProcessors: hardware.logical_processors,
			physicalProcessors: hardware.physical_processors,
			processorMaxFreq: hardware.processor_max_freq,
			battery:
				(hardware.battery as unknown as number) == 0 ? false : true,
			oemId: hardware.oem_id || undefined,
		},
		banned: (hardware.banned as unknown as number) == 0 ? false : true,
	};

	return hardware_data;
}
