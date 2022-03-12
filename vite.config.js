import { fileURLToPath, URL } from 'url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'index.js'),
            name: 'vue-verovio-canvas',
            fileName: (format) => `vue-verovio-canvas.${format}.js`,
        },
    },
});
