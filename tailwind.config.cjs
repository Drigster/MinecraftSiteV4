import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ["class"],
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		"./node_modules/layerchart/**/*.{svelte,js}",
	],
	safelist: ["dark"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			colors: {
				"background-dark": "var(--background-dark)",
				"background": "var(--background)",
				"background-light": "var(--background-light)",
				"accent": "var(--accent)",
				"text": "var(--text)",
				"text-muted": "var(--text-muted)",
				"border": "var(--border)"
			}
		},
	},
};

export default config;
