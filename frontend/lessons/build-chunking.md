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
