import { db } from "$lib/db";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "$env/static/private";

export const load = async ({ params }) => {
	let token;
	try {
		token = jwt.verify(params.token, JWT_SECRET) as jwt.JwtPayload;
	} catch {
		return {
			message: "Время запроса истекло или токен недействителен!",
		};
	}

	if (token != undefined) {
		const user = await db
			.selectFrom("User")
			.select("id")
			.where("email", "=", token.email)
			.executeTakeFirst();

		if (user == null) {
			return {
				message: "Токен не действителен!",
			};
		}
	}
};
