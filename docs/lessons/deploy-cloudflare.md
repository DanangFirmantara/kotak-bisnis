# Lesson: Deploy Frontend ke Cloudflare (Workers static assets) — Kotak Bisnis

> Dari setup deploy pertama (2026-10-23). Frontend = Vite SPA statis, data masih dummy (tanpa env).
> Target utama: **Cloudflare Workers** (static assets, tanpa Worker script). Pages hanya catatan perbedaan.

## Setting build (Workers & Pages → Create → Import a repository)
| Setting | Nilai |
|---|---|
| Project / Worker name | `kotak-bisnis` (harus sama dengan `name` di `frontend/wrangler.jsonc`) |
| Production branch | `main` |
| Root directory | `frontend` |
| Build command | `npm run build` (sudah termasuk `tsc -b` → type error = build gagal) |
| Deploy command | `npx wrangler deploy` |
| Node | `frontend/.node-version` berisi `22` — dibaca dari **root directory build** |

URL hasil: `https://kotak-bisnis.<subdomain-akun>.workers.dev`.

## `frontend/wrangler.jsonc` (wajib di-commit)
- Static assets only: **tanpa `main`**, `assets.directory: "./dist"`.
- SPA fallback: `assets.not_found_handling: "single-page-application"` → path yang tidak cocok dengan file
  dilayani `index.html` (status 200). File yang ada (`/assets/*`, favicon) tetap dilayani duluan.
- `wrangler` jadi **devDependency** → versi terkunci di lockfile dan `$schema: node_modules/wrangler/config-schema.json` valid.
- Jangan pasang `@cloudflare/vite-plugin` — hanya perlu kalau ada Worker script/SSR.
- Script `npm run deploy` = build + `wrangler deploy` (deploy manual dari lokal, butuh `wrangler login`).
- Validasi tanpa upload/login: `npx wrangler deploy --dry-run` (setelah `npm run build`).

## Error 100324 — `_redirects` SPA ala Pages ditolak Workers
```
Invalid _redirects configuration:
Line 5: Infinite loop detected in this rule. ... [code: 100324]
```
- Penyebab: rule `/*  /index.html  200`. Workers assets otomatis *strip* `.html`/`/index`
  (`html_handling: auto-trailing-slash`), jadi `/index.html` → `/` → cocok `/*` lagi → loop.
- Fix: **hapus `public/_redirects`**, ganti dengan `not_found_handling: "single-page-application"`.
- `_redirects` tetap boleh dipakai untuk redirect sungguhan (301/302 ke path lain), bukan untuk SPA fallback.

## Auto-setup wrangler di CI (kalau repo tanpa config)
Wrangler 4.x yang tidak menemukan `wrangler.jsonc` menjalankan auto-setup: install `wrangler` +
`@cloudflare/vite-plugin`, generate `wrangler.jsonc` sementara, lalu deploy dari `dist/wrangler.json`.
Hasilnya tidak deterministik & tidak terlihat di repo → selalu commit `wrangler.jsonc` sendiri.

## `_headers`
- `frontend/public/_headers` didukung Workers static assets (format sama dengan Pages) → ikut ter-copy ke `dist/`.
- `/assets/*` → `Cache-Control: public, max-age=31536000, immutable` (nama file ber-hash).
  **Jangan** cache `index.html` lama — dia yang menunjuk ke hash aset terbaru.
- Rule `/*` → `Cache-Control: no-cache` wajib ada (HTML + SPA fallback tidak boleh di-cache lama). Rule yang cocok
  **digabung**, jadi `/assets/*` harus melepas warisan dengan `! Cache-Control` sebelum set `immutable`
  (kalau tidak, header terkirim dobel). Tanpa ini: Safari memakai index.html lama → chunk hash lama 404 → fallback
  text/html → "'text/html' is not a valid JavaScript MIME type" (solusi lengkap: `frontend/lessons/build-chunking.md`).

## Syarat agar deep link aman
`base` Vite harus `/` (default) → `dist/index.html` memuat `/assets/...` (absolut). Kalau `base: './'`,
deep link `/a/b` akan mencari `/a/assets/...` → fallback ke index.html → layar putih.

## Perbedaan singkat vs Cloudflare Pages
| | Workers (dipakai) | Pages |
|---|---|---|
| Config | `wrangler.jsonc` + deploy command | Output directory `dist` di dashboard |
| SPA fallback | `not_found_handling: "single-page-application"` | `_redirects` `/* /index.html 200` (atau otomatis bila tanpa `404.html`) |
| `_headers` | Didukung | Didukung |
| Domain | `*.workers.dev` | `*.pages.dev` |
| Env build | Settings → Build → Variables | Settings → Environment Variables |

## Nanti saat backend ada
- `VITE_API_URL` dkk di-set sebagai **build variables** (Worker → Settings → Build → Variables and secrets),
  bukan runtime variables Worker — `VITE_*` di-bake saat **build time** → ubah nilai = wajib redeploy
  (lihat `docker-local.md`).
- Proxy `/api` Vite hanya berlaku di dev server — di Cloudflare tidak ada proxy, frontend memanggil URL backend langsung.
- CORS backend harus mengizinkan `https://kotak-bisnis.<subdomain>.workers.dev` dan URL preview
  (`https://*-kotak-bisnis.<subdomain>.workers.dev`) → pakai `allowedOriginPatterns`, bukan `allowedOrigins`.
- Jangan taruh secret di `VITE_*` — semua nilainya terlihat di bundle client.
