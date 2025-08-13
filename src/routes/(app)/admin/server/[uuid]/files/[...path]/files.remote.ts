import { query } from '$app/server';
import z from 'zod';

export const getDir = query(z.string() ,async (path) => {
	let response: Response;
	try {
		response = await fetch(
			`http://localhost:3000/files/${path}`,
		);
	} catch (err) {
		console.log(err);
		return error(
			503,
			"Launcher manager seems to be down,\nplease contact the administrator!",
		);
	}

	const files: FileType[] = await response.json();

	return posts;
});