// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  // ⭐ Load env berdasarkan mode (development/production)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // ⭐ Base path — root domain
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
      open: false,          // ⭐ Jangan auto-open browser (ganggu di CI)
      host: true,           // ⭐ Expose ke network (test dari HP)
      proxy: {
        // ⭐ Proxy API ke backend (development)
        '/api': {
          target: env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
      port: 4173,
      host: true,
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      target: 'es2020',           // ⭐ Target browser modern
      minify: 'oxc',              // ⭐ FIX: Vite 8 pakai oxc (bukan esbuild)
      chunkSizeWarningLimit: 1000, // ⭐ Warning > 1 MB
      cssCodeSplit: true,         // ⭐ Split CSS per chunk
      reportCompressedSize: false, // ⭐ Skip size report (build lebih cepat)
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

          // PrimeReact
          if (id.includes('node_modules/primereact/')) {
            return 'primereact-vendor'
          }

          // PrimeIcons (font)
          if (id.includes('node_modules/primeicons/')) {
            return 'primeicons-vendor'
          }

          // PrimeFlex (CSS)
          if (id.includes('node_modules/primeflex/')) {
            return 'primeflex-vendor'
          }

          // ⭐ PDF library (besar, ~200 KB)
          if (id.includes('node_modules/html2pdf.js')) {
            return 'pdf-vendor'
          }

          // ⭐ Markdown (besar, ~160 KB)
          if (
            id.includes('node_modules/react-markdown') ||
            id.includes('node_modules/remark-gfm') ||
            id.includes('node_modules/unified') ||
            id.includes('node_modules/remark-') ||
            id.includes('node_modules/rehype-') ||
            id.includes('node_modules/mdast-') ||
            id.includes('node_modules/micromark')
          ) {
            return 'markdown-vendor'
          }

          // HTTP client
          if (id.includes('node_modules/axios')) {
            return 'http-vendor'
          }

          // Helmet (SEO)
          if (id.includes('node_modules/react-helmet-async')) {
            return 'helmet-vendor'
          }

          // Vendor lain
          if (id.includes('node_modules/')) {
            return 'vendor'
          }
        },
        },
      },
    },

    // ⭐ Optimasi dependency (pre-bundle)
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
      ],
    },
  }
})