import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  	tailwindcss()
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return;

          if (id.includes('@monaco-editor') || id.includes('monaco-editor')) {
            return 'monaco';
          }
          if (id.includes('framer-motion')) {
            return 'framer';
          }
          if (
            id.includes('react-markdown') ||
            id.includes('remark-') ||
            id.includes('rehype-') ||
            id.includes('mdast') ||
            id.includes('micromark') ||
            id.includes('hast') ||
            id.includes('unist') ||
            id.includes('vfile') ||
            id.includes('bail') ||
            id.includes('unified') ||
            id.includes('trough')
          ) {
            return 'markdown';
          }
          if (id.includes('katex')) {
            return 'katex';
          }
          if (id.includes('jszip')) {
            return 'jszip';
          }
          if (
            id.includes('react-router') ||
            id.includes('@remix-run') ||
            id.includes('history')
          ) {
            return 'router';
          }
          if (id.includes('@tanstack')) {
            return 'query';
          }
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('scheduler')
          ) {
            return 'react';
          }
          return 'vendor';
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: process.env.VITE_API_TARGET || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
})

