import { JWT_SECRET } from "$env/static/private";
import { db } from "$lib/db";
import jwt from "jsonwebtoken";

export const load = async ({ params }) => {
	try {
		const token = jwt.verify(params.token, JWT_SECRET) as jwt.JwtPayload;
		const user = await db
			.selectFrom("User")
			.select(["id", "verified"])
			.where("email", "=", token.email)
			.executeTakeFirst();

		if (user == null) {
			return { message: "Пользователь не найден!" };
		}

		if (user.verified) {
			return { message: "Почта уже подтверждена!" };
		}

		await db
			.updateTable("User")
			.where("id", "=", user.id)
			.set({
				verified: true,
			})
			.execute();

		return { message: "Почта успешно подтверждена!" };
	} catch {
		return { message: "Время запроса истекло!" };
	}
};
