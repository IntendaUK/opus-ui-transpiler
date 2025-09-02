import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const pluginHotReload = require('@intenda/vite-plugin-opus-hot-reload/src/plugin');

export default defineConfig({
	plugins: [
		react(),
		pluginHotReload()
	]
});
