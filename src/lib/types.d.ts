export type LauncherUserSession = {
	id: number | string;
	accessToken: string;
	refreshToken: string;
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
