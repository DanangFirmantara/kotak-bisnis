import { readFileSync } from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/** Versi app dari package.json — diinjeksi ke kode lewat `define` (dibaca di src/lib/app-meta.ts). */
const { version: appVersion } = JSON.parse(
  readFileSync(path.resolve(import.meta.dirname, 'package.json'), 'utf8'),
) as { version: string }

/** Pola path paket di node_modules (aman untuk separator Windows `\` maupun `/`). */
const pkg = (names: string) => new RegExp(`[\\\\/]node_modules[\\\\/](${names})[\\\\/]`)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Metadata build (bukan integrasi): versi + waktu build untuk halaman /health. Tipe di src/build-meta.d.ts.
  // Dev server: __BUILD_TIME__ = waktu server dev dijalankan.
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Vendor dipecah per kelompok supaya cache browser awet & tidak ada chunk > 500 kB.
        // Page sendiri di-lazy-load (src/router.tsx).
        // PENTING: group menarik dependensinya secara rekursif (includeDependenciesRecursively default true),
        // jadi paket yang juga dipakai entry (react, clsx) harus di group berprioritas LEBIH TINGGI dari
        // vendor-charts — kalau tidak, ikut tersedot ke sana dan chunk chart termuat di halaman awal.
        codeSplitting: {
          groups: [
            {
              name: 'vendor-charts',
              test: pkg('recharts|victory-vendor|d3-[a-z-]+|internmap|@reduxjs|react-redux|redux|redux-thunk|reselect|immer|decimal\\.js-light'),
              priority: 30,
            },
            { name: 'vendor-motion', test: pkg('motion|framer-motion|motion-dom|motion-utils'), priority: 30 },
            // clsx juga dependensi recharts → wajib prioritas > vendor-charts, kalau tidak ikut tersedot ke sana
            {
              name: 'vendor-ui',
              test: pkg('radix-ui|@radix-ui|@floating-ui|clsx|class-variance-authority|cn'),
              priority: 35,
            },
            { name: 'vendor-react', test: pkg('react|react-dom|scheduler|react-router|@tanstack'), priority: 40 },
          ],
        },
      },
    },
  },
})
