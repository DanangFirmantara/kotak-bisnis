# Lesson: Integrasi API Frontend ↔ Backend — Kotak Bisnis

> Gabungan lesson IPA-ESETUPLIMIT (api-types-alignment, upload-result-handling, local-dev proxy) + Undanganku
> (`NEXT_PUBLIC_*` build-time), diadaptasi ke Vite + React.

## Vite proxy (dev)
```ts
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } },
  },
})
```
Frontend selalu pakai path relatif `/api/...` → tidak perlu CORS di dev, dan sama persis di production (nginx/backend serve di origin yang sama).

## `VITE_*` env = build time
`import.meta.env.VITE_*` di-embed ke bundle saat `npm run build` (sama seperti `NEXT_PUBLIC_*` di Next.js — pernah bikin URL `undefined/...` di Undanganku).
- Ganti nilai → **wajib rebuild**. Di Docker → `ARG` + `--build-arg`, bukan `environment:` di compose
- Hanya variabel berprefix `VITE_` yang terekspos; jangan taruh secret di situ (terbaca siapa pun di browser)

## TypeScript ↔ Java DTO alignment
- Interface di `src/types/` **mirror persis** record DTO backend (nama field camelCase sama, nullable → `| null`)
- Pisahkan **request** vs **response** type (`CreateSalesRequest` ≠ `SalesResponse`) — response punya `id`, audit, field turunan
- `BigDecimal` dari Jackson datang sebagai `number` (default) — kalau butuh presisi penuh, backend kirim string & frontend format, putuskan sekali di awal
- `LocalDate` → `"2026-10-23"` (string), `LocalDateTime` → `"2026-10-23T10:15:00"` (tanpa zona) → parse via helper, jangan `new Date()` sembarangan (geser zona waktu)
- Ubah DTO backend → update interface di commit/task yang sama

## TanStack Query
- `queryKey` berisi semua parameter (`['sales-summary', year, unitId]`) — kalau tidak, filter ganti tapi data lama tampil
- Setelah mutation sukses → `queryClient.invalidateQueries({ queryKey: [...] })`, jangan refetch manual
- Default `staleTime` dashboard 30–60 detik supaya pindah halaman tidak spam request

## Satu query, banyak kartu → `select`
Data dashboard satu payload, tapi tiap kartu/header butuh potongan berbeda. Pakai `queryKey` yang **sama** +
`select` → satu fetch, tanpa prop drilling (pola di `hooks/useDashboard.ts`):
```ts
const selectStats = (d: DashboardData) => d.stats     // fungsi stabil di level MODUL, bukan inline
export const useDashboardStats = () => useDashboardSlice(selectStats)
```
`select` inline (arrow baru tiap render) membuat hasil dihitung ulang tiap render.

## Loading state di dalam `Stagger`
Kartu yang dibungkus `StaggerItem` harus **tetap ter-mount** dari skeleton sampai data datang (key stabil per
slot, ganti isi di dalamnya via `QueryState`). Kalau skeleton dan konten jadi elemen berbeda, item di-remount →
muncul tanpa animasi stagger / animasi terulang saat data masuk atau ganti filter.

## HTTP 200 ≠ sukses untuk bulk upload/import
Endpoint import/upload massal bisa 200 tapi sebagian baris gagal. Response typed:
```ts
interface UploadResult { successCount: number; failedCount: number; errors: { row: number; message: string }[] }
```
Toast bercabang: semua sukses → success; sebagian gagal → warning + daftar error; semua gagal → error.

## Error dari backend
Backend kirim `ProblemDetail` (`{title, status, detail}`) → `apiFetch` lempar `ApiError` dengan `detail` → tampilkan `detail` ke user, bukan pesan generik.
