import { generateOneTimeCode } from "$lib/server/auth.js";

export async function GET() {
	for (let index = 0; index < 100; index++) {
		console.log(generateOneTimeCode());
	}

	return new Response();
}
