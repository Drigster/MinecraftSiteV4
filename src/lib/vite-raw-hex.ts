import { type Plugin } from "vite";
import fs from "fs";

export default function hexPlugin(): Plugin {
	return {
		name: "vite-plugin-hex",
		transform(src, id) {
			// Check for the ?hex suffix
			if (id.endsWith("?hex")) {
				const filePath = id.slice(0, id.indexOf("?"));

				// Read the file as a Buffer
				const fileBuffer = fs.readFileSync(filePath);

				// Convert the Buffer to a hex string
				const hexString = fileBuffer.toString("hex");

				// Return the hex string as a module
				return {
					code: `export default '${hexString}';`,
					map: null, // Add source map if needed
				};
			}
		},
	};
}
