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
				"background": "rgba(0, 0, 0, 0.6)",
				"background-light": "var(--background-light)",
				"accent": "rgb(252, 111, 83)",
				"text": "rgb(221, 234, 253)",
				"text-muted": "rgb(163, 163, 163)",
				"border": "var(--border)"
			}
		},
	},
};

export default config;
