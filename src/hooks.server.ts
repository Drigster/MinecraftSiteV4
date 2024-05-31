import { ADMIN_PASSWORD, ADMIN_USERNAME, NODE_ENV, ORIGIN } from "$env/static/private";
import bcrypt from "bcrypt";
import { error, json, text } from "@sveltejs/kit";
import db from "$lib/db.ts";
import dotenv from "dotenv";
dotenv.config();

if (NODE_ENV == "development") {
	const uuid = "7943cf5b-6d20-462a-9eac-d5dc70d2456a";

	let user = await db.user.findUnique({
		where: {
			uuid: uuid,
		},
	});

	if (user == null) {
		const salt = uuid.replaceAll("-", "");
		user = await db.user.create({
			data: {
				uuid: uuid,
				email: "admin@foxy.town",
				username: ADMIN_USERNAME,
				password: bcrypt.hashSync(ADMIN_PASSWORD + salt, 12),
				salt: salt,
				salted: true,
			},
		});
	}
}

function isContentType(request: Request, ...types: string[]) {
	const type = request.headers.get("content-type")?.split(";", 1)[0].trim() ?? "";
	return types.includes(type);
}
function isFormContentType(request: Request) {
	return isContentType(request, "application/x-www-form-urlencoded", "multipart/form-data");
}

const allowedPaths: RegExp[] = [/\/api\/.*/];

export async function handle({ event, resolve }) {
	let forbidden =
		event.request.method === "POST" &&
		event.request.headers.get("origin") !== event.url.origin &&
		event.request.headers.get("origin") !== ORIGIN &&
		isFormContentType(event.request);

	allowedPaths.forEach((path) => {
		if (event?.url?.pathname?.match(path) != null) {
			forbidden = forbidden && false;
		}
	});

	if (forbidden) {
		const csrfError = error(
			403,
			`Cross-site ${event.request.method} form submissions are forbidden`,
		);
		if (event.request.headers.get("accept") === "application/json") {
			return json(csrfError.body, { status: csrfError.status });
		}
		return text(csrfError.body.message, { status: csrfError.status });
	}

	return resolve(event);
}
