# Kotak Bisnis

Dashboard bisnis sederhana untuk memantau kondisi usaha dalam satu layar — pendapatan, pengeluaran, saldo,
pelanggan, dan transfer terbaru — dengan tampilan **glassmorphism** yang lembut dan animasi masuk bertahap.

> **Status: pratinjau UI (v0.1.0).** Frontend sudah bisa dijalankan dengan **data contoh (dummy)**.
> Backend (Spring Boot + PostgreSQL) dan autentikasi JWT masih dalam rencana.

---

## Fitur

| Halaman | Route | Keterangan |
|---|---|---|
| Dashboard | `/` | Kartu statistik, grafik Saldo (filter Mingguan/Bulanan/Tahunan), gauge Pendapatan, profil, kartu bisnis 3D, transfer terakhir, keamanan akun |
| Pusat Bantuan | `/bantuan` | FAQ dengan panel accordion |
| Login | `/login` | Form dengan validasi; akun demo di bawah |
| Health | `/health` | Versi app, waktu build, status — publik, tanpa login |
| Akses ditolak | `/akses-ditolak` | Halaman 403 (demo alur: `/demo-akses-ditolak`) |
| Tidak ditemukan | path lain | Halaman 404 |
| Segera hadir | `/dompet`, `/statistik`, `/laporan`, `/pelanggan`, `/kalender`, `/pengaturan` | Menu yang belum dibuat |

Responsive untuk desktop, tablet, dan HP (≥ 360px).

**Akun demo (data dummy):** `admin@kotakbisnis.id` / `Admin@123`

---

## Tech Stack

**Frontend (sudah ada)**
- [Vite](https://vite.dev) + [React 19](https://react.dev) + TypeScript (strict)
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query), [React Router](https://reactrouter.com)
- [Recharts](https://recharts.org) (grafik), [Motion](https://motion.dev) (animasi), [Lucide](https://lucide.dev) (ikon)
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) (form & validasi)
- Font [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)

**Backend (rencana)**
- Java 21, Spring Boot 3.5, Spring Security + JWT
- PostgreSQL 16, Flyway
- Docker Compose untuk lingkungan lokal

---

## Menjalankan Aplikasi

### Prasyarat
- [Node.js](https://nodejs.org) **22 LTS** atau lebih baru (minimal 20.19)
- npm (ikut terpasang bersama Node.js)

### Langkah

```bash
# 1. Clone repo
git clone https://github.com/DanangFirmantara/kotak-bisnis.git
cd kotak-bisnis

# 2. Install dependensi frontend
cd frontend
npm install

# 3. Jalankan dev server
npm run dev
```

Buka **http://localhost:5173**.

### Script lain (dari folder `frontend/`)

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server dengan hot reload (port 5173) |
| `npm run build` | Type-check + build produksi ke `frontend/dist/` |
| `npm run preview` | Menjalankan hasil build secara lokal |
| `npm run lint` | Lint dengan oxlint |

> Dev server sudah menyiapkan proxy `/api` → `http://localhost:8080` untuk backend nanti.

---

## Struktur Project

```
kotak-bisnis/
├── frontend/              # Aplikasi React (Vite)
│   ├── src/
│   │   ├── components/    # Komponen shared: ui, common, layout, charts, form, motion
│   │   ├── features/      # Halaman per fitur: dashboard, help, auth, health, errors, ...
│   │   ├── hooks/         # Hook TanStack Query & utilitas
│   │   ├── services/      # Lapisan data (sekarang mengembalikan data dummy)
│   │   ├── mocks/         # Data contoh
│   │   ├── schemas/       # Schema validasi Zod
│   │   ├── lib/           # Helper: format, api, responsive, app-meta
│   │   └── types/         # Tipe TypeScript
│   └── lessons/           # Catatan teknis (lesson learned) frontend
├── backend/               # (rencana) Spring Boot — saat ini baru berisi lessons/
└── docs/                  # Project map, planning, lessons infra
```

Peta lengkap file, komponen shared, dan route ada di [`docs/project-map.md`](docs/project-map.md).

---

## Prinsip Pengembangan

- **Shared-first & DRY**: komponen, validasi, dan helper dibuat sebagai shared dulu, lalu dipakai ulang
- **Data lewat service layer**: komponen tidak mengimpor data dummy langsung, jadi pindah ke API nyata cukup
  dengan mengubah isi `services/`
- **Konvensi commit**: `<type>(<scope>): <deskripsi>`, misalnya `feat(dashboard): tambah kartu saldo`

### Branch

| Branch | Fungsi |
|---|---|
| `main` | Branch utama / stabil |
| `development` | Branch pengembangan — semua perubahan di-push ke sini lalu di-merge ke `main` |

---

## Roadmap

- [x] UI dashboard, bantuan, login, health, halaman 404/403 (data dummy)
- [x] Responsive mobile
- [ ] Backend Spring Boot + PostgreSQL (Docker)
- [ ] Autentikasi JWT & hak akses per role
- [ ] Integrasi data nyata ke dashboard
- [ ] Halaman Dompet, Statistik, Laporan, Pelanggan, Kalender, Pengaturan

---

## Lisensi

Dirilis di bawah [MIT License](LICENSE).
