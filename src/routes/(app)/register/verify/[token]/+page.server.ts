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
					issuer: "register",
					audience: "register.verify",
				},
			)
		).payload;
	} catch (err) {
		console.log(err);
		return { message: "Время запроса истекло!" };
	}

	const user = await locals.db
		.selectFrom("User")
		.select(["id", "verified"])
		.where("email", "=", payload.email as string)
		.executeTakeFirst();

	if (user == undefined) {
		return {
			message: "Ошибка сервера, попробуйте повторить верификацию!",
		};
	}

	if (user.verified) {
		return { message: "Почта уже подтверждена!" };
	}

	await locals.db
		.updateTable("User")
		.where("id", "=", user.id)
		.set({
			verified: true,
		})
		.execute();

	return { message: "Почта успешно подтверждена!" };
};
