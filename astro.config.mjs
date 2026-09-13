// @ts-check
import {defineConfig} from "astro/config";
import clarityIntegration from "astro-microsoft-clarity-integration";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
	vite: {
		css: {
			transformer: "lightningcss",
		},
	},

	integrations: [
		clarityIntegration({
			projectId: "yd4hrp2pj4",
			enabled: import.meta.env.PROD,
			scriptStage: "head-inline",
			debug: false,
			async: true,
			defer: false,
		}),
	],

	output: "static",
	adapter: cloudflare({
		imageService: "compile",
	}),
});
