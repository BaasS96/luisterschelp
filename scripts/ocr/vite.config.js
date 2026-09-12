import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './ocr.js',
      name: 'OCRModule',
      fileName: (format) => `ocr-bundle.${format === 'es' ? 'js' : 'umd.js'}`
    },
    outDir: './dist',
    rollupOptions: {
      output: {
        // This bundles dependencies into the output
        format: 'umd',
        name: 'OCRModule'
      }
    }
  }
});