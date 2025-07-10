import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true			
		}),
		prerender: {
			handleHttpError: "warn"
		}
	},

	// Disable accessibility warnings 
	onwarn: (warning, handler) => {
		if (warning.code.includes("a11y")) return;
		handler(warning);
	}
};

export default config;
