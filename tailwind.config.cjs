/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		extend: {
			colors: {
				text: "hsl(var(--text))",
				"text-muted": "hsl(var(--text-muted))",
				background: "hsl(var(--background))",
				accent: "hsl(var(--accent))",
				border: "hsl(var(--border))",
			},
		},
	},
	plugins: [],
};
