import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	server: {
		port: 3000,
	},
	preview: {
		port: 3000,
	},
	build: {
		outDir: 'dist',
	},
	css: {
		postcss: './postcss.config.js',
	},
	resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx'],
	},
	esbuild: {
		loader: {
			'.js': 'jsx', // Treat .js files as .jsx
		},
	},
});
