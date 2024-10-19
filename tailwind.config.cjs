/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		colors: {
			transparent: "transparent",
			current: "currentColor",
			primary: "rgb(221, 234, 253)",
			secondary: "rgb(163, 163, 163)",
			accent: "#FC6F53",
			background: "white",
			error: "red",
			notify: "yellow",
		},
	},
	plugins: [],
};
