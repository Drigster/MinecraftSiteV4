import type { Selectable } from "kysely";
import type { Session } from "./auth";
import type { User } from "./db/schema";
import { DateTime, Interval } from "luxon";
import fs from "fs";
import { ORIGIN } from "$env/static/private";
import { createHash } from "crypto";

export type LauncherUserSession = {
	id: number | string;
	accessToken: string;
	expire: number;
	user: LauncherUser;
};

export type LauncherUser = {
	username: string;
	uuid: string;
	permissions: string[];
	roles: string[];
	assets: {
		SKIN: {
			url: string;
			digest: string;
			metadata?: {
				model: "slim";
			};
		};
		CAPE?: {
			url: string;
			digest: string;
		};
	};
};

export async function createLauncherUser(user: Selectable<User>) {
	const skinUrl = ORIGIN + "/api/skin/" + user.username;

	let skin;
	if (fs.existsSync("./files/skins/" + user.id.toString() + ".png")) {
		skin = fs.readFileSync("./files/skins/" + user.id.toString() + ".png");
	} else {
		skin = fs.readFileSync("./files/default.png");
	}

	const permissions: string[] = [];

	if (user.role == "ADMIN") {
		permissions.push("*");
	}

	const userData: LauncherUser = {
		username: user.username,
		uuid: user.uuid,
		permissions: permissions,
		roles: [user.role],
		assets: {
			SKIN: {
				url: skinUrl,
				digest: createHash("sha256").update(skin).digest("hex"),
				// metadata: false //TODO: user.isSkinSlim
				//     ? {
				//           model: "slim",
				//       }
				//     : undefined,
			},
		},
	};

	return userData;
}

export async function createLauncherUserSession(
	session_token: string,
	session: Session,
	user: Selectable<User>,
) {
	const sessionData: LauncherUserSession = {
		id: session.id,
		accessToken: session_token,
		expire: Math.floor(
			Interval.fromDateTimes(DateTime.now(), session.expires_at).length(
				"seconds",
			),
		),
		user: await createLauncherUser(user),
	};

	return sessionData;
}
