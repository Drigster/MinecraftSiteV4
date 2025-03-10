export type Profile = {
	title: string;
	uuid: string;
	dir: string;
	hash: string;
	filename: string;
};

export type FileType = {
	name: string;
	path: string;
	size?: number;
	type: "file" | "directory";
};

export type ProfileType = {
	title: string;
	uuid: string;
	hash: string;
};

export type ApiError = {
	code: number;
	message: string;
};

export type ProfileData = {
	title: string;
	uuid: string;
	version: string;
	info: string;
	servers: {
		name: string;
		serverAddress: string;
		serverPort: number;
	}[];
	limited?: boolean;
};
