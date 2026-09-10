import * as v from "valibot";

export const loginSchema = v.object({
	login: v.pipe(v.string(), v.nonEmpty("Логин не может быть пустым")),
	_password: v.pipe(v.string(), v.nonEmpty("Пароль не может быть пустым")),
});

export const registerSchema = v.pipe(
	v.object({
		username: v.pipe(
			v.string(),
			v.trim(),
			v.minLength(3, "Минимальная длина 3 символа"),
			v.maxLength(16, "Максимальная длина 16 символов"),
			v.regex(
				/[a-zA-Z0-9_]+/,
				"Допустимы только английские буквы, цифры и _",
			),
		),
		email: v.pipe(v.string(), v.trim(), v.email("Неверный формат почты")),
		_password: v.pipe(
			v.string(),
			v.minLength(8, "Минимальная длина 8 символов"),
			v.maxLength(255, "Максимальная длина 255 символов"),
		),
		_password2: v.pipe(v.string(), v.nonEmpty()),
	}),
	v.forward(
		v.partialCheck(
			[["_password"], ["_password2"]],
			(input) => input._password === input._password2,
			"Пароли не совпадают",
		),
		["_password2"],
	),
);

export const forgotPasswordSchema = v.object({
	login: v.pipe(v.string(), v.nonEmpty("Логин не может быть пустым")),
});

export const changePasswordSchema = v.pipe(
	v.object({
		_current_password: v.pipe(v.string(), v.nonEmpty()),
		_password: v.pipe(
			v.string(),
			v.minLength(8, "Минимальная длина 8 символов"),
			v.maxLength(255, "Максимальная длина 255 символов"),
		),
		_password2: v.pipe(v.string(), v.nonEmpty()),
	}),
	v.forward(
		v.partialCheck(
			[["_password"], ["_password2"]],
			(input) => input._password === input._password2,
			"Пароли не совпадают",
		),
		["_password2"],
	),
);

export const recoverPasswordSchema = v.pipe(
	v.object({
		token: v.pipe(v.string(), v.nonEmpty()),
		_password: v.pipe(
			v.string(),
			v.minLength(8, "Минимальная длина 8 символов"),
			v.maxLength(255, "Максимальная длина 255 символов"),
		),
		_password2: v.pipe(v.string(), v.nonEmpty()),
	}),
	v.forward(
		v.partialCheck(
			[["_password"], ["_password2"]],
			(input) => input._password === input._password2,
			"Пароли не совпадают",
		),
		["_password2"],
	),
);

export const changeEmailSchema = v.object({
	email: v.pipe(v.string(), v.trim(), v.email("Неверный формат почты")),
});

export const confirmEmailChangeSchema = v.object({
	code: v.pipe(
		v.string(),
		v.trim(),
		v.regex(v.DIGITS_REGEX, "Код должен сожержать только цифры"),
		v.length(6, "Длина кода 6 цифр"),
	),
});

export const changeUsernameSchema = v.object({
	username: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(3, "Минимальная длина 3 символа"),
		v.maxLength(16, "Максимальная длина 16 символов"),
		v.regex(
			/[a-zA-Z0-9_]+/,
			"Никнейм имеет недопустимые символы, разрещены только английские буквы, цыфры и _",
		),
	),
});
