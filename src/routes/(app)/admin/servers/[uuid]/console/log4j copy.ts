export default function (hljs: any) {
		return {
			name: "Log4j",
			case_insensitive: true,
			contains: [
				// Log message content after colon - this is where we look for MC colors
				{
					begin: /:\s*/,
					end: /$/,
					returnBegin: true,
					contains: [
						// Stage 1: Parse color + text (can contain stage 2 and 3)
						{
							className: "mc-black",
							begin: /(§0.*?)(?=§[0-9a-fr]|$)/,
							contains: [
								// Stage 2: Text decorations inside color blocks
								{
									className: "mc-obfuscated",
									begin: /(§k.*?)(?=§[0-9a-fr]|$)/,
									contains: [
										// Stage 3: Individual code symbols
										{
											className: "mc-code",
											begin: /§[0-9a-fk-or]/,
										},
									],
								},
								{
									className: "mc-bold",
									begin: /(§l.*?)(?=§[0-9a-fr]|$)/,
									contains: [
										{
											className: "mc-code",
											begin: /§[0-9a-fk-or]/,
										},
									],
								},
								{
									className: "mc-strikethrough",
									begin: /(§m.*?)(?=§[0-9a-fr]|$)/,
									contains: [
										{
											className: "mc-code",
											begin: /§[0-9a-fk-or]/,
										},
									],
								},
								{
									className: "mc-underline",
									begin: /(§n.*?)(?=§[0-9a-fr]|$)/,
									contains: [
										{
											className: "mc-code",
											begin: /§[0-9a-fk-or]/,
										},
									],
								},
								{
									className: "mc-italic",
									begin: /(§o.*?)(?=§[0-9a-fr]|$)/,
									contains: [
										{
											className: "mc-code",
											begin: /§[0-9a-fk-or]/,
										},
									],
								},
								// Stage 3: Individual code symbols at color level
								{
									className: "mc-code",
									begin: /§[0-9a-fk-or]/,
								},
							],
						},
						{
							className: "mc-dark-blue",
							begin: /(§1.*?)(?=§[0-9a-fr]|$)/,
							contains: [
								{
									className: "mc-obfuscated",
									begin: /(§k.*?)(?=§[0-9a-fr]|$)/,
									contains: [
										{
											className: "mc-code",
											begin: /§[0-9a-fk-or]/,
										},
									],
								},
								{
									className: "mc-bold",
									begin: /(§l.*?)(?=§[0-9a-fr]|$)/,
									contains: [
										{
											className: "mc-code",
											begin: /§[0-9a-fk-or]/,
										},
									],
								},
								{
									className: "mc-strikethrough",
									begin: /(§m.*?)(?=§[0-9a-fr]|$)/,
									contains: [
										{
											className: "mc-code",
											begin: /§[0-9a-fk-or]/,
										},
									],
								},
								{
									className: "mc-underline",
									begin: /(§n.*?)(?=§[0-9a-fr]|$)/,
									contains: [
										{
											className: "mc-code",
											begin: /§[0-9a-fk-or]/,
										},
									],
								},
								{
									className: "mc-italic",
									begin: /(§o.*?)(?=§[0-9a-fr]|$)/,
									contains: [
										{
											className: "mc-code",
											begin: /§[0-9a-fk-or]/,
										},
									],
								},
								{
									className: "mc-code",
									begin: /§[0-9a-fk-or]/,
								},
							],
						},
						// ... (repeat the same pattern for all other colors)
						{
							className: "mc-dark-green",
							begin: /(§2.*?)(?=§[0-9a-fr]|$)/,
							contains: [
								{
									className: "mc-obfuscated",
									begin: /(§k.*?)(?=§[0-9a-fr]|$)/,
									contains: [
										{
											className: "mc-code",
											begin: /§[0-9a-fk-or]/,
										},
									],
								},
								{
									className: "mc-bold",
									begin: /(§l.*?)(?=§[0-9a-fr]|$)/,
									contains: [
										{
											className: "mc-code",
											begin: /§[0-9a-fk-or]/,
										},
									],
								},
								{
									className: "mc-strikethrough",
									begin: /(§m.*?)(?=§[0-9a-fr]|$)/,
									contains: [
										{
											className: "mc-code",
											begin: /§[0-9a-fk-or]/,
										},
									],
								},
								{
									className: "mc-underline",
									begin: /(§n.*?)(?=§[0-9a-fr]|$)/,
									contains: [
										{
											className: "mc-code",
											begin: /§[0-9a-fk-or]/,
										},
									],
								},
								{
									className: "mc-italic",
									begin: /(§o.*?)(?=§[0-9a-fr]|$)/,
									contains: [
										{
											className: "mc-code",
											begin: /§[0-9a-fk-or]/,
										},
									],
								},
								{
									className: "mc-code",
									begin: /§[0-9a-fk-or]/,
								},
							],
						},
						// Continue this pattern for all colors...

						// Stage 2: Standalone text decorations (can contain stage 3)
						{
							className: "mc-obfuscated",
							begin: /(§k.*?)(?=§[0-9a-fr]|$)/,
							contains: [
								{
									className: "mc-code",
									begin: /§[0-9a-fk-or]/,
								},
							],
						},
						{
							className: "mc-bold",
							begin: /(§l.*?)(?=§[0-9a-fr]|$)/,
							contains: [
								{
									className: "mc-code",
									begin: /§[0-9a-fk-or]/,
								},
							],
						},
						{
							className: "mc-strikethrough",
							begin: /(§m.*?)(?=§[0-9a-fr]|$)/,
							contains: [
								{
									className: "mc-code",
									begin: /§[0-9a-fk-or]/,
								},
							],
						},
						{
							className: "mc-underline",
							begin: /(§n.*?)(?=§[0-9a-fr]|$)/,
							contains: [
								{
									className: "mc-code",
									begin: /§[0-9a-fk-or]/,
								},
							],
						},
						{
							className: "mc-italic",
							begin: /(§o.*?)(?=§[0-9a-fr]|$)/,
							contains: [
								{
									className: "mc-code",
									begin: /§[0-9a-fk-or]/,
								},
							],
						},
						{
							className: "mc-reset",
							begin: /(§r.*?)(?=§[0-9a-fr]|$)/,
							contains: [
								{
									className: "mc-code",
									begin: /§[0-9a-fk-or]/,
								},
							],
						},

						// Stage 3: Standalone individual code symbols
						{
							className: "mc-code",
							begin: /§[0-9a-fk-or]/,
						},

						// Regular plugin names in brackets (non-colored)
						{
							className: "string",
							begin: /\[([^\]§]+)\]/,
							relevance: 5,
						},
					],
					relevance: 8,
				},
				// Timestamp
				{
					className: "number",
					begin: /^\[(\d{2}:\d{2}:\d{2})\]/,
					relevance: 10,
				},
				// Thread/Level
				{
					className: "meta",
					begin: /\[([^\/\]]+)\/(TRACE|DEBUG|INFO|WARN|ERROR|FATAL)\]/,
					relevance: 10,
				},
				// Logger name
				{
					className: "title",
					begin: /\[([a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*)\](?=:)/,
					relevance: 8,
				},
				// Regular plugin names
				{
					className: "string",
					begin: /:\s+\[([^\]§]+)\]/,
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
					begin: /[vV]?((\d+\.)+\d+)(\+(\d+\.)+\d+)?(([-][\w\d]+)+)?/,
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