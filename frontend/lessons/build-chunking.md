# Lesson: Build Chunking — Vite 8 (Rolldown)

> Dari Tahap 6 dashboard UI (2026-10-23): bundle tunggal 1.047 kB → entry 27 kB.

## Pola yang dipakai
1. **Lazy route** — page di-load via helper `lazyPage()` (`React.lazy`) di `router.tsx`, `Suspense` di `AppLayout` sekitar `<Outlet/>`
2. **Vendor groups** di `vite.config.ts` → `build.rolldownOptions.output.codeSplitting.groups`:
   `vendor-react` (40) · `vendor-ui` (35) · `vendor-motion` (30) · `vendor-charts` (30)

## Jebakan: dependensi tersedot ke group yang salah
Group `codeSplitting` default `includeDependenciesRecursively: true` → group ikut menarik **dependensi**
modulnya. `react` dan `clsx` (dependensi recharts) tersedot ke `vendor-charts` → chunk chart ikut di-preload
di halaman awal walau route sudah lazy.

**Fix:** paket yang juga dipakai entry (react, clsx/cva/cn, radix) taruh di group dengan `priority` **lebih
tinggi** dari group chart. Lihat komentar di `vite.config.ts`.

## Cara verifikasi
Setelah `npm run build`, buka `dist/index.html` → cek `<link rel="modulepreload">`: `vendor-charts` **tidak boleh**
ada di situ (hanya dimuat saat route dashboard dibuka). Tambah library berat baru → ulangi cek ini.

## Chunk usang setelah redeploy (layar putih "'text/html' is not a valid JavaScript MIME type")
**Gejala:** iPhone Safari (juga browser lain) setelah redeploy menampilkan "Unexpected Application Error! 'text/html' is not a valid JavaScript MIME type".

**Penyebab:** browser memakai `index.html` lama dari cache → me-request chunk lazy hash lama (`assets/DashboardPage-<hashLama>.js`) yang sudah tidak ada. Workers static assets dengan `not_found_handling: "single-page-application"` membalas `index.html` (text/html) untuk file yang tidak ada → dynamic import gagal → React Router tampilkan error default (belum ada `errorElement`).

**Solusi 3 lapis:**
1. **Cache header** — `frontend/public/_headers`: `/*` → `Cache-Control: no-cache`; `/assets/*` → `! Cache-Control` (lepas warisan) + `public, max-age=31536000, immutable`.
2. **Auto-recover** — `src/lib/chunk-reload.ts`: `isChunkLoadError()`, `reloadOnceForStaleChunk()` (guard sessionStorage + timestamp 10 dtk, try/catch), `installChunkErrorRecovery()` (listener `vite:preloadError`, dipanggil di `main.tsx`). `lazyPage()` di `router.tsx` juga memanggilnya saat `import()` gagal, lalu lempar ulang error.
3. **Error page** — `errorElement: <RouteErrorPage />` di kedua root route (`features/errors/RouteErrorPage.tsx`, pakai `StatusView`): pesan "Versi baru tersedia" untuk chunk usang, tombol Muat ulang + Dashboard, `error.message` hanya di DEV. Route `*` tetap NotFoundPage.

Tambah lazy loader baru di luar `lazyPage()` → tangani error chunk lewat helper yang sama.
