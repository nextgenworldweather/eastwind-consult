import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  css: { postcss: './postcss.config.js', },
  base: '/eastwind-consult/', // Required for GitHub Pages
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'), // Entry point
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
