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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Separă Monaco Editor în chunk propriu
          monaco: ['@monaco-editor/react'],
          // Separă Framer Motion
          framer: ['framer-motion'],
          // Libs rămân în vendor
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:9090',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

