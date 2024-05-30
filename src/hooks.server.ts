import { ADMIN_PASSWORD, ADMIN_USERNAME, ORIGIN } from "$env/static/private";
import bcrypt from "bcrypt";
import { error, json, text } from "@sveltejs/kit";

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
