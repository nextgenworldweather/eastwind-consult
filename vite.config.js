import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from 'vite-plugin-commonjs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), commonjs()],
  base: '/eastwind-consult/', // Required for GitHub Pages
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'), // Entry point
      external: [
        'core-js-pure/stable/object/assign.js',
        'emoji-mart/css/emoji-mart.css' // Externalize emoji-mart CSS
      ],
    },
  },
  resolve: {
    alias: {
      'core-js-pure': 'core-js-pure/es',
      '@': resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.json'],
  },
  server: {
    port: 3000, // For local development only
    open: true,
  },
});
