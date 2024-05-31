import { JWT_SECRET } from "$env/static/private";
import db from "$lib/db";
import jwt from "jsonwebtoken";

export const load = async ({ params }) => {
	let token;
	try {
		token = jwt.verify(params.token, JWT_SECRET) as jwt.JwtPayload;
		const user = await db.user.findUnique({
			where: {
				email: token.email,
			},
		});

		if (user == null) {
			return { message: "Пользователь не найден!" };
		}

		if (user.verified) {
			return { message: "Почта уже подтверждена!" };
		}

		await db.user.update({
			where: {
				id: user.id,
			},
			data: {
				verified: true,
			},
		});

		return { message: "Почта успешно подтверждена!" };
	} catch (error) {
		return { message: "Время запроса истекло!" };
	}
};
