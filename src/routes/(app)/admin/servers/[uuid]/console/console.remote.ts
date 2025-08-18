import { form, getRequestEvent } from "$app/server";
import { error } from "@sveltejs/kit";

export const sendCommand = form(async (data) => {
    const { locals, cookies } = getRequestEvent();
    
    if (locals.user == null || locals.user.role != "ADMIN") {
        error(404);
    }

    let command = data.get("command");

    if(command == null) {
        return {
            success: false,
            message: "Command not found"
        }
    }

    let response: Response;
	try {
		response = await fetch(
			`http://localhost:3000/command?command=${command}`,
		);
	} catch (err) {
		console.log(err);
		return error(
			503,
			"Launcher manager seems to be down,\nplease contact the administrator!",
		);
	}

    return { success: true };
});