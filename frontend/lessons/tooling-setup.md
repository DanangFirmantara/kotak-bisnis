# Lesson: Tooling & Setup Quirks — Frontend

> Dari scaffold Tahap 0 (2026-10-23): Vite 8, React 19, TypeScript 6, Tailwind 4, shadcn CLI 4.

## TypeScript 6 (default create-vite)
- `baseUrl` **deprecated** → alias cukup `"paths": { "@/*": ["./src/*"] }` di `tsconfig.json` + `tsconfig.app.json`
- `erasableSyntaxOnly` aktif → **tidak boleh**: constructor parameter property (`constructor(public x: number)`),
  `enum`, `namespace`. Pakai field eksplisit, union string / `as const` object
- Type-check: `npx tsc -b` dari `frontend/`

## shadcn CLI 4
- Init non-interaktif: `npx shadcn@latest init -t vite -b radix -p nova -y --no-monorepo --no-rtl`
  (tanpa `-p` CLI berhenti di pilihan preset)
- Tambah komponen: `npx shadcn@latest add <nama> -y`
- shadcn sekarang pakai paket npm **`cn`** (bukan clsx + tailwind-merge) dan paket **`radix-ui`** (bukan
  `@radix-ui/react-*` satuan). `src/lib/utils.ts` = `export { cn } from "cn"`
- Jangan edit file hasil generate di `components/ui/` — bungkus/extend (contoh: `ActionButton` membungkus `Button`)

## React 19 `useId()` di SVG
Hasil `useId()` bisa mengandung karakter yang merusak `url(#id)` (gradient/clipPath Recharts) → pakai helper
`useSvgId` di `components/charts/chart-utils.ts`.

## Recharts 3
- Tipe custom tooltip: `TooltipContentProps` (export dari `recharts`)
- Gauge setengah lingkaran: radius dihitung dari sisi terpendek → render chart persegi dalam wrapper
  `aspect-[2/1] overflow-hidden`
- Bar peringkat dengan label teks yang bisa kembar (dua produk bernama sama): sumbu kategori pakai **index** sebagai
  `dataKey` dan format tick lewat tabel label — teks label sebagai key menggabungkan bar. Bar horizontal: `layout="vertical"`,
  `YAxis type="category"` + `width` tetap (lebih sempit di HP), `XAxis hide`, nilai lewat `LabelList position="right"` + margin kanan
- `Tooltip content` memberi `payload[0].payload` bertipe tidak pasti → narrowing manual (`typeof x === 'object' && 'index' in x`)
  alih-alih cast ke `any`

## Shell di Windows
- PowerShell 5.1: `npx shadcn add` menulis progres ke stderr → tampak `NativeCommandError` padahal sukses.
  Cek file di disk, jangan hanya exit code
- Bash tool: heredoc panjang berisi backtick / `\|` sering gagal parse atau eksekusi parsial. Untuk edit via
  script, tulis file `.cjs` ke scratchpad lalu jalankan, atau pakai Edit/Write
- Bash tool: `python3 - <<EOF` bisa menggantung sampai timeout (`python3` di Windows = stub Store). `node -e "…"` juga rapuh
  bila string berisi backtick (jadi command substitution), kutip tunggal, atau `
` (jadi newline literal di dalam string).
  Edit file pakai Edit/Write; untuk edit massal tulis skrip `.cjs` ke file lalu jalankan; file besar tulis dengan Write
- oxlint `only-export-components`: cva yang dipakai di luar komponennya → file `*-variants.ts` terpisah

## Tesseract.js (OCR di browser) & uji lib di Node
- Paket CommonJS. `await import('tesseract.js')` di Vite/Rolldown membungkus ekspor di `default` → pakai
  `const api = mod.default ?? mod` lalu `api.createWorker`, `api.PSM`, `api.OEM` (`tessedit_pageseg_mode` bertipe enum: pakai
  `api.PSM.SINGLE_COLUMN`, bukan string `'4'`). Jadi chunk sendiri (±17 kB), tidak masuk bundle awal
- Worker, core WASM, dan model bahasa default dari CDN jsdelivr (worker via blob URL) — tidak perlu konfigurasi Vite/`_headers`
  selama tidak ada CSP; model di-cache browser. Self-host di `public/` (`workerPath`/`corePath`/`langPath`) hanya bila CDN jadi masalah
- Worker dibuat malas, disimpan sebagai promise di level modul, dan **di-reset ke null saat gagal** supaya "Coba lagi" benar-benar
  mencoba ulang; `terminate()` saat meninggalkan halaman
- Uji logika `lib/` tanpa browser: `npx esbuild entry.ts --bundle --platform=node --alias:@=./src --outfile=lib.cjs` dari `frontend/`,
  lalu skrip Node di scratchpad (`@napi-rs/canvas` menggantikan canvas untuk decode/crop foto, `tesseract.js` jalan di Node). Fungsi
  piksel preprocess dibuat murni (`enhancePixels`) supaya bisa dipakai kedua sisi

## Vite `define` untuk metadata build
- `vite.config.ts`: `define: { __APP_VERSION__: JSON.stringify(pkg.version), __BUILD_TIME__: JSON.stringify(new Date().toISOString()) }`
- Baca `package.json` dengan `JSON.parse(readFileSync(...)) as { version: string }` — `tsconfig.node` tidak
  mengaktifkan `resolveJsonModule`
- Deklarasi tipe di `src/build-meta.d.ts` (`declare const __APP_VERSION__: string`); baca **hanya** lewat
  `lib/app-meta.ts` (`APP_VERSION`, `BUILD_TIME`)
- Di dev server, `__BUILD_TIME__` = waktu dev server dijalankan

## Form: react-hook-form + Zod
- Pin `@hookform/resolvers@~5.2.2`. Versi ≥ 5.5 / 6.x mendaftarkan banyak optional peer (`@typeschema/*`,
  `effect`) yang bentrok dengan zod 4 → npm 11 `ERESOLVE`. **Jangan** pakai `--legacy-peer-deps`
- React 19: input shared cukup `ComponentProps<'input'>` + spread — `ref` dari `register()` ikut sebagai prop biasa,
  tanpa `forwardRef`
- Kunci form saat submit dengan `<fieldset disabled>`, bukan prop `disabled` per input ter-register (RHF bisa
  membuat nilainya `undefined`)
- `useFieldArray`: properti `id` di item dipakai RHF sebagai key internal → kunci data sendiri pakai nama lain
  (`uid`), jangan `id`
- Kolom turunan di tabel editable (mis. subtotal = qty × harga − diskon): `register(name, { valueAsNumber: true,
  onChange })` — `onChange` dipanggil **setelah** nilai field diset, jadi `getValues` di handler sudah berisi nilai
  terbaru; hitung ulang lalu `setValue(..., { shouldDirty: true })`. Dari `Controller` (input uang), `getValues` bisa belum
  mencerminkan nilai yang baru diubah → teruskan nilai itu sebagai `override` ke fungsi hitung ulang
- Satu fitur dengan dua bentuk form (mis. mode ringkas vs lengkap): schema + `useForm` terpisah, tabel/komponen generik dipakai
  bersama (`EditableTable`), kartu turunan (cek total, grafik) membaca `useWatch` dari form yang sama — jangan state ganda
- **Input uang terformat (`MoneyInput`)**: komponen terkontrol (`value: number | null`) dipasang lewat `Controller`. Teks tampilan
  diturunkan dari nilai (`formatNumberInput`), state draft hanya untuk tanda "-" yang belum disusul angka. Saat mengetik ambil
  **digit saja** — `parseNumberInput` yang menafsirkan pecahan (`55,5`) hanya untuk paste, kalau dipakai saat mengetik "557.30"
  (hasil hapus satu digit) salah dibaca pecahan. Caret: hitung digit di kiri caret sebelum format, pulihkan di `useLayoutEffect`
- Meneruskan `ref` ke input internal (React 19): jangan menimpa `rest.ref.current` (lint `react(immutability)`); pakai ref
  internal + `useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, [])`

## Motion
- `StaggerItem` hanya menerima `children` + `className` — atribut lain (`aria-hidden`, `role`) pasang di elemen anak

## Dokumentasi
- Tabel markdown (`docs/project-map.md` dll): karakter `|` **di dalam backtick** tetap harus ditulis `\|`
  (mis. tipe union `'single' \| 'multiple'`), kalau tidak kolom tabel rusak
