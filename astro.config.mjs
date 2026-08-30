// @ts-check
import {defineConfig} from "astro/config";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
	vite: {
		css: {
			transformer: "lightningcss",
		},
	},

	output: "static",
	adapter: cloudflare({
		imageService: "compile",
	}),
});
