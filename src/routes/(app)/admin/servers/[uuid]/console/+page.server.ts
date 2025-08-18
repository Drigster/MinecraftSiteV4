import { error } from "@sveltejs/kit";
import hljs from "highlight.js";
import log4j from "./log4j";

export const load = async ({ parent, locals }) => {
	if (locals.user?.role != "ADMIN") {
		return error(404, "Not found");
	}

    const server = (await parent()).server;

	let response: Response;
	try {
		response = await fetch(
			`http://${server.localIp}:${server.localPort}/file/logs/latest.log`,
		);
	} catch (err) {
		console.log(err);
		return error(
			503,
			"Launcher manager seems to be down,\nplease contact the administrator!",
		);
	}

	if (response.status != 200) {
		return error(
			response.status,
			await response.text()
		)
	}

	hljs.registerLanguage("log4j", log4j);
    let log = hljs.highlight(await response.text(), {
        language: "log4j",
    }).value;

	return { log };
};
