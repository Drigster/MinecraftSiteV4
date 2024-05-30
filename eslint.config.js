// eslint.config.js

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: [
			".DS_Store",
			"node_modules/",
			"build/",
			".svelte-kit",
			"package/",
			".env",
			".env.*",
			"!.env.example",
			"pnpm-lock.yaml",
			"package-lock.json",
			"yarn.lock",
		],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...tseslint.configs.stylistic,
	{
		rules: {
			"no-duplicate-imports": "warn",
			"sort-imports": [
				"warn",
				{
					ignoreDeclarationSort: true,
					allowSeparatedGroups: true,
				},
			],
		},
	},
);
