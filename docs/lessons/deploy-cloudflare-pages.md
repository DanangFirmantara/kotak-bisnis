# Lesson: Deploy Frontend ke Cloudflare Pages — Kotak Bisnis

> Dari setup deploy pertama (2026-10-23). Frontend = Vite SPA statis, data masih dummy (tanpa env).

## Setting build (Pages → Connect to Git)
| Setting | Nilai |
|---|---|
| Production branch | `main` (branch lain → preview URL otomatis) |
| Root directory | `frontend` |
| Build command | `npm run build` (sudah termasuk `tsc -b` → type error = build gagal) |
| Output directory | `dist` (relatif ke root directory) |
| Node | `frontend/.node-version` berisi `22` — Pages membacanya dari **root directory build** |

## `_redirects` & `_headers` di `frontend/public/`
Vite menyalin isi `public/` apa adanya ke `dist/` → kedua file ikut ter-deploy tanpa config tambahan.

- `_redirects`: `/*  /index.html  200` — SPA fallback. Tanpa ini refresh `/bantuan` = 404 Cloudflare.
  Pages melayani file statis yang **ada** duluan, jadi `/assets/*` & favicon tidak ikut di-rewrite.
  404 untuk path asing tetap ditangani route `*` di React Router (status HTTP-nya 200 — wajar untuk SPA).
- `_headers`: `/assets/*` → `Cache-Control: public, max-age=31536000, immutable` (nama file ber-hash).
  **Jangan** cache `index.html` lama — dia yang menunjuk ke hash aset terbaru.
- Komentar `#` boleh di kedua file.

## Syarat agar deep link aman
`base` Vite harus `/` (default) → `dist/index.html` memuat `/assets/...` (absolut). Kalau `base: './'`,
deep link `/a/b` akan mencari `/a/assets/...` → rewrite ke index.html → layar putih.

## Nanti saat backend ada
- `VITE_API_URL` dkk di-set di **Settings → Environment Variables** Pages (pisahkan Production vs Preview).
  `VITE_*` di-bake saat **build time** → ubah nilai = wajib redeploy (lihat `docker-local.md`).
- Proxy `/api` Vite hanya berlaku di dev server — di Pages tidak ada proxy, frontend memanggil URL backend langsung.
- CORS backend harus mengizinkan domain production `https://<project>.pages.dev` **dan** preview
  `https://*.<project>.pages.dev` (pakai `allowedOriginPatterns`, bukan `allowedOrigins`, untuk wildcard).
- Jangan taruh secret di `VITE_*` — semua nilainya terlihat di bundle client.
