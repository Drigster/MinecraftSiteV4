/* eslint-disable */
export default function (hljs: any) {
	// Stage 3: Code symbols (innermost)
	const codeSymbols = {
		className: "mc-code",
		begin: /§[0-9a-fk-or]/,
		relevance: 1,
	};

	// Stage 2: Text decorations (can contain stage 3)
	const textDecorations = [
		{
			className: "mc-obfuscated",
			begin: /(§k.*?)(?=§[0-9a-fr])|$/,
			contains: [codeSymbols],
		},
		{
			className: "mc-bold",
			begin: /(§l.*?)(?=§[0-9a-fr])|$/,
			contains: [codeSymbols],
		},
		{
			className: "mc-strikethrough",
			begin: /(§m.*?)(?=§[0-9a-fr])|$/,
			contains: [codeSymbols],
		},
		{
			className: "mc-underline",
			begin: /(§n.*?)(?=§[0-9a-fr])|$/,
			contains: [codeSymbols],
		},
		{
			className: "mc-italic",
			begin: /(§o.*?)(?=§[0-9a-fr])|$/,
			contains: [codeSymbols],
		},
	];

	// Stage 1: Colors (can contain stage 2 and 3)
	const colors = [
		{
			className: "mc-black",
			begin: /(§0.*?)(?=§[0-9a-fr])|$/,
			contains: [...textDecorations, codeSymbols],
		},
		{
			className: "mc-dark-blue",
			begin: /(§1.*?)(?=§[0-9a-fr])|$/,
			contains: [...textDecorations, codeSymbols],
		},
		{
			className: "mc-dark-green",
			begin: /(§2.*?)(?=§[0-9a-fr])|$/,
			contains: [...textDecorations, codeSymbols],
		},
		{
			className: "mc-dark-aqua",
			begin: /(§3.*?)(?=§[0-9a-fr])|$/,
			contains: [...textDecorations, codeSymbols],
		},
		{
			className: "mc-dark-red",
			begin: /(§4.*?)(?=§[0-9a-fr])|$/,
			contains: [...textDecorations, codeSymbols],
		},
		{
			className: "mc-dark-purple",
			begin: /(§5.*?)(?=§[0-9a-fr])|$/,
			contains: [...textDecorations, codeSymbols],
		},
		{
			className: "mc-gold",
			begin: /(§6.*?)(?=§[0-9a-fr])|$/,
			contains: [...textDecorations, codeSymbols],
		},
		{
			className: "mc-gray",
			begin: /(§7.*?)(?=§[0-9a-fr])|$/,
			contains: [...textDecorations, codeSymbols],
		},
		{
			className: "mc-dark-gray",
			begin: /(§8.*?)(?=§[0-9a-fr])|$/,
			contains: [...textDecorations, codeSymbols],
		},
		{
			className: "mc-blue",
			begin: /(§9.*?)(?=§[0-9a-fr])|$/,
			contains: [...textDecorations, codeSymbols],
		},
		{
			className: "mc-green",
			begin: /(§a.*?)(?=§[0-9a-fr])|$/,
			contains: [...textDecorations, codeSymbols],
		},
		{
			className: "mc-aqua",
			begin: /(§b.*?)(?=§[0-9a-fr])|$/,
			contains: [...textDecorations, codeSymbols],
		},
		{
			className: "mc-red",
			begin: /(§c.*?)(?=§[0-9a-fr])|$/,
			contains: [...textDecorations, codeSymbols],
		},
		{
			className: "mc-light-purple",
			begin: /(§d.*?)(?=§[0-9a-fr])|$/,
			contains: [...textDecorations, codeSymbols],
		},
		{
			className: "mc-yellow",
			begin: /(§e.*?)(?=§[0-9a-fr])|$/,
			contains: [...textDecorations, codeSymbols],
		},
		{
			className: "mc-white",
			begin: /(§f.*?)(?=§[0-9a-fr])|$/,
			contains: [...textDecorations, codeSymbols],
		},
		{
			className: "mc-reset",
			begin: /(§r.*?)(?=§[0-9a-fr])|$/,
			contains: [...textDecorations, codeSymbols],
		},
	];

	return {
		name: "Log4j",
		case_insensitive: true,
		contains: [
			{
				className: "color-code",
				begin: /§[0-9a-fk-orx]/,
			},
			// Timestamp
			{
				className: "number",
				begin: /^\[(\d{2}\w+\d{4} )?(\d{2}:\d{2}:\d{2}(\.\d+)?)\]/,
				relevance: 10,
			},
			// Logger name
			{
				className: "title",
				begin: /\[([a-zA-Z_][a-zA-Z0-9_ ]*(\.[a-zA-Z_][a-zA-Z0-9_ ]*)*)[/]?[a-zA-Z_]*\](?=:)/,
				relevance: 8,
			},
			// Thread/Level
			{
				begin: /\[([^\/\]]+)\//,
				end: /\]/,
				relevance: 10,
				contains: [
					{
						className: "trace",
						begin: /TRACE/,
					},
					{
						className: "debug",
						begin: /DEBUG/,
					},
					{
						className: "info",
						begin: /INFO/,
					},
					{
						className: "warn",
						begin: /WARN/,
					},
					{
						className: "error",
						begin: /ERROR/,
					},
					{
						className: "fatal",
						begin: /FATAL/,
					},
				],
			},
			// Regular plugin names
			{
				className: "string",
				begin: /(?<=:[\t ]*)\[.+\]/,
				relevance: 6,
			},
			// Exception stack traces
			{
				className: "built_in",
				begin: /^\s*at\s+/,
				end: /$/,
				relevance: 8,
			},
			{
				className: "built_in",
				begin: /^Caused by:/,
				relevance: 10,
			},
			// Version numbers
			{
				className: "number",
				begin: /v\d+\.\d+(\.\d+)?/,
				relevance: 3,
			},
			// URLs
			{
				className: "link",
				begin: /https?:\/\/[^\s]+/,
				relevance: 5,
			},
		],
	};
}
