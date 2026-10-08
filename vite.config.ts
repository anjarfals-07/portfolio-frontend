// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // ⭐ Base path — untuk root domain
  // Kalau deploy di subfolder (misal /app/), ganti jadi '/app/'
  base: '/',

  plugins: [react()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5173,
    open: true,
    // ⭐ Proxy API ke backend (development)
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    // ⭐ Split vendor chunk — FUNCTION-BASED (aman, no warning)
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router')
          ) {
            return 'react-vendor'
          }

          // PrimeReact + PrimeIcons
          if (
            id.includes('node_modules/primereact/') ||
            id.includes('node_modules/primeicons/')
          ) {
            return 'prime-vendor'
          }

          // Chart libs (kalau ada)
          if (
            id.includes('node_modules/chart.js') ||
            id.includes('node_modules/recharts')
          ) {
            return 'chart-vendor'
          }

          // Semua vendor lain
          if (id.includes('node_modules/')) {
            return 'vendor'
          }
        },
      },
    },
  },
})