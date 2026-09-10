import { JWT_SECRET } from "$env/static/private";
import * as jose from "jose";

export const load = async ({ params, locals }) => {
	let payload: jose.JWTPayload | undefined;
	try {
		payload = (
			await jose.jwtVerify(
				params.token,
				new TextEncoder().encode(JWT_SECRET),
				{
					issuer: "recover.password",
					audience: "recover.password",
				},
			)
		).payload;
	} catch (err) {
		console.log(err);
		return { message: "Время запроса истекло!" };
	}

	const user = await locals.db
		.selectFrom("User")
		.select("id")
		.where("email", "=", payload.email as string)
		.executeTakeFirst();

	if (user == null) {
		return {
			message: "Время запроса истекло!",
		};
	}
};
