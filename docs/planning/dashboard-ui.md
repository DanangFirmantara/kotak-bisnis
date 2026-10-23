# Planning — Dashboard UI (data dummy)

**Tujuan:** halaman dashboard mengikuti referensi screenshot (layout kartu bento, sidebar ikon, chart), gaya
**glassmorphism + warna soft**, animasi fade-in bertahap saat halaman dibuka. Data **dummy**; integrasi backend nanti.

**Metode:** shared-first & DRY (lihat CLAUDE.md). Tiap tahap dikerjakan `react-agent`, lapor → konfirmasi → eksekusi.

Status: ⬜ belum · 🔄 jalan · ✅ selesai

---

## Design Direction

| Aspek | Keputusan |
|---|---|
| Font | **Plus Jakarta Sans** (free, via `@fontsource-variable/plus-jakarta-sans` — offline, tanpa CDN) |
| Background | Gradient soft off-white → mint/abu kebiruan + 2–3 blob blur warna pastel (memberi efek kaca) |
| Kartu (glass) | `bg-white/50` + `backdrop-blur-xl` + border `white/60` + shadow lembut, `rounded-3xl` |
| Aksen utama | Sage green soft (± `#7C9A82`), kartu highlight = sage gradient |
| Status | Naik = hijau soft (± `#5FAE8B`), turun = merah soft (± `#E08A8A`) |
| Teks | Slate gelap untuk angka, slate-500 untuk label |
| Icon | `lucide-react` |
| Chart | Recharts — garis smooth, tanpa grid tebal, warna aksen |
| Animasi | Library `motion` — fade + slide-up kecil, stagger ±60–80 ms per kartu; mati kalau `prefers-reduced-motion` |
| Bahasa UI | Indonesia, format Rupiah via `src/lib/format.ts` |

Semua warna jadi **token** di `src/index.css` (`--color-*`) — komponen tidak boleh hardcode hex.

## Pemetaan kartu (screenshot → Kotak Bisnis)

| Screenshot | Versi kita | Isi dummy |
|---|---|---|
| Spent this month | Pengeluaran bulan ini | nominal + mini bar chart |
| New clients | Pelanggan baru | jumlah + sparkline |
| Earnings today | Pendapatan hari ini | nominal |
| Activity (hijau, Live) | Aktivitas (highlight sage) | nominal + sparkline + badge Live |
| Balance | Saldo | line chart + 2 chip (rasio %, saldo) + filter Bulanan |
| Earnings | Pendapatan | total + % vs bulan lalu + gauge setengah lingkaran |
| Profile | Profil pemilik usaha | avatar inisial, 3 statistik |
| Credit card | Kartu bisnis | **kartu CSS glass** dengan efek tilt 3D (tanpa gambar) + tombol |
| Your Transfers | Transfer terakhir | list 3 item, nominal +/− berwarna |
| Keep you safe | Keamanan akun | icon + teks + tombol |
| AI "Sage" | Orb dekoratif (glass + glow) | hanya hiasan — fitur AI di luar scope |

---

## Tahapan

### Tahap 0 — Scaffold frontend ✅
- Vite + React + TS strict, Tailwind v4, shadcn/ui init, alias `@/`
- Install: `lucide-react`, `recharts`, `motion`, `@tanstack/react-query`, `react-router`, `@fontsource-variable/plus-jakarta-sans`
- Token warna + font + background gradient di `src/index.css`
- **Verifikasi:** `npm run dev` jalan, `npx tsc --noEmit` bersih

### Tahap 1 — Shared foundation ✅
- `components/ui/GlassCard` (varian: default, highlight) · `components/motion/FadeIn`, `Stagger`
- `components/common/IconButton`, `Avatar` (inisial), `TrendBadge` (+/−%), `SectionHeader` (judul + aksi)
- `components/charts/Sparkline`, `MiniBarChart`, `LineAreaChart`, `GaugeChart`
- `lib/format.ts` (Rupiah, angka ringkas, persen)
- `types/dashboard.ts` · `mocks/dashboard.ts` · `services/dashboard.service.ts` (return mock) · `hooks/useDashboard.ts`
- Daftarkan semua di `docs/project-map.md`

### Tahap 2 — Layout shell ✅
- `components/layout/AppLayout`, `Sidebar` (nav ikon + tooltip + avatar bawah), `Header` (sapaan, search, notifikasi)
- Router: `/` → Dashboard di dalam `AppLayout`

### Tahap 3 — Baris statistik ✅
- `StatCard` (shared) dipakai 4×: Pengeluaran, Pelanggan baru, Pendapatan hari ini, Aktivitas (highlight)

### Tahap 4 — Kartu chart ✅
- Kartu Saldo (LineAreaChart + chip + filter) · Kartu Pendapatan (GaugeChart)

### Tahap 5 — Kartu lain ✅
- Profil · Kartu bisnis CSS 3D (GlassPaymentCard + Tilt) · Transfer terakhir · Keamanan akun · Orb dekoratif (AssistantOrb)
- Shared baru: QueryState (pola loading/error/empty), ActionButton (turunan shadcn Button)

### Tahap 6 — Polish ✅
- Responsive (xl bento 4 kolom → md/lg 2 kolom → mobile 1 kolom + bottom nav `MobileNav`), timing masuk `ENTRANCE_DELAY`, reduced-motion, kontras `ink-muted` ≥ 5:1
- StatCard nominal ringkas otomatis saat sempit (container query) · lazy route + vendor chunk (tidak ada chunk > 500 kB)

---

## Catatan
- Tes UI manual oleh user di `http://localhost:5173`
- Backend, auth, login page: **di luar scope** planning ini
