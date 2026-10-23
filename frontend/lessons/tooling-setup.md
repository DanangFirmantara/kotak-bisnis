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

## Shell di Windows
- PowerShell 5.1: `npx shadcn add` menulis progres ke stderr → tampak `NativeCommandError` padahal sukses.
  Cek file di disk, jangan hanya exit code
- Bash tool: heredoc panjang berisi backtick / `\|` sering gagal parse atau eksekusi parsial. Untuk edit via
  script, tulis file `.cjs` ke scratchpad lalu jalankan, atau pakai Edit/Write
- oxlint `only-export-components`: cva yang dipakai di luar komponennya → file `*-variants.ts` terpisah

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

## Motion
- `StaggerItem` hanya menerima `children` + `className` — atribut lain (`aria-hidden`, `role`) pasang di elemen anak

## Dokumentasi
- Tabel markdown (`docs/project-map.md` dll): karakter `|` **di dalam backtick** tetap harus ditulis `\|`
  (mis. tipe union `'single' \| 'multiple'`), kalau tidak kolom tabel rusak
