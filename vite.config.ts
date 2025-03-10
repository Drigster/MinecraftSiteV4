import hexPlugin from "./src/lib/vite-raw-hex";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [hexPlugin(), sveltekit()],
	// Carbon charts
	ssr: {
		noExternal:
			process.env.NODE_ENV === "production" ? ["@carbon/charts"] : [],
	},
});
