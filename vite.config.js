import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: './dist',
    rollupOptions: {
      output: {
        assetFileNames: "[name].[ext]",
        chunkFileNames: "[name].[ext]",
        entryFileNames: "[name].js",
      },
    },
  },
});