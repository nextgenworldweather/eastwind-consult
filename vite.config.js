import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
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
      '@': resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.json'],
  },
  server: {
    port: 3000, // For local development only
    open: true,
  },
});
