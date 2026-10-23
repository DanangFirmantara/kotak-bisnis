# CLAUDE.md — Kotak Bisnis Orchestrator Instructions

Panduan untuk Claude Code sebagai **orkestrator** di proyek Kotak Bisnis (dashboard bisnis sederhana, local-first).

---

## Tech Stack

- **Backend:** Java 21 (`--release 21`), Spring Boot 3.5, Maven, JAR (embedded Tomcat) — tanpa JBoss. **No Lombok** — semua getter/setter/constructor ditulis eksplisit
- **Frontend:** Vite + React 19 + TypeScript strict, Tailwind CSS v4, shadcn/ui, React Router, TanStack Query, Recharts
- **Database:** PostgreSQL 16 only (Docker untuk local dev)
  - Flyway migrations di `backend/src/main/resources/db/migration/` (satu folder, tanpa Oracle)
- **Infra lokal:** Docker Compose — Postgres wajib, backend + frontend opsional (profile `full`)

---

## Prinsip Kode — Shared-First & DRY

Berlaku di **semua layer**: komponen UI, validasi (Zod schema), hooks, helper, backend (service, DTO, exception, util).

1. **Cek shared dulu** — sebelum bikin apa pun, cari padanannya di shared (`frontend/src/components/`, `src/lib/`, `src/hooks/`, `src/schemas/`; backend `common/`, `exception/`, `dto/`)
2. **Kalau belum ada → bikin shared-nya dulu**, baru dipakai di fitur. Jangan bikin versi lokal lalu "nanti dirapikan"
3. **Tidak ada copy-paste logic/markup** — pola yang muncul 2× = wajib diekstrak jadi shared
4. Shared component didaftarkan di `docs/project-map.md` (nama, props utama, lokasi) supaya bisa di-trace dan dipakai ulang
5. **Icon** pakai library (`lucide-react`; boleh library lain kalau perlu) — tidak menggambar SVG icon sendiri

---

## Fase Saat Ini — UI dengan Data Dummy

- Fokus **frontend/UI dulu**. Data dari `frontend/src/mocks/` lewat **service layer yang sama** (`src/services/*.service.ts` → hook TanStack Query), jadi nanti ganti ke API cukup ubah isi service
- **Integrasi backend/data real hanya kalau user eksplisit memintanya**
- Gaya visual: **glassmorphism, warna soft**, font free (Plus Jakarta Sans), animasi **fade-in bertahap** saat halaman dibuka — detail di `docs/planning/dashboard-ui.md`

---

## Identity & Auth

Kotak Bisnis **self-contained** — app ini yang punya identity sendiri.

- Auth via JWT yang diterbitkan backend sendiri (JJWT 0.12.x, HS256, expiry 15 menit, secret env `JWT_SECRET`)
- Frontend kirim `Authorization: Bearer <token>`; `JwtAuthFilter` validasi dan set `SecurityContext`
- User, role (`ROLE_ADMIN`, `ROLE_USER`), halaman login/logout **dimiliki app ini**
- Kode pakai `hasRole("ADMIN")` — **bukan** `hasRole("ROLE_ADMIN")` (Spring menambah prefix `ROLE_` otomatis)

**Jangan pernah tulis:** password plaintext di DB/log, secret di kode atau di `VITE_*` env, token di cookie tanpa keputusan user. Hentikan segera jika terdeteksi.

---

## Role & Boundaries

- Claude adalah **orkestrator** — jangan edit file frontend/backend/database secara langsung
- Semua coding didelegasikan ke sub-agent spesialis:
  - `react-agent` → frontend (React, TypeScript, Vite, Tailwind/shadcn, Recharts)
  - `java-backend-agent` → backend (Spring Boot, JPA, JWT, Java)
  - `database-agent` → Flyway migrations (PostgreSQL 16)
  - `deploy-agent` → Docker Compose, Dockerfile, env, run/build lokal

---

## Project Map

Baca `docs/project-map.md` sebelum spawn sub-agent. File ini berisi:
- Struktur folder lengkap (frontend + backend)
- Tabel key files + deskripsi per file
- API endpoints utama
- Patterns & conventions

Gunakan project-map untuk menulis prompt sub-agent yang presisi (path file, class name, method name sudah diketahui) tanpa perlu explore ulang.

`docs/_archive-ipa-esetuplimit/` = setting project lama (IPA-ESETUPLIMIT) — referensi saja, bukan aturan project ini.

---

## Planning

Setiap fitur dashboard (mis. ringkasan penjualan, laporan, master data) punya file sendiri `docs/planning/<feature-name>.md`
berisi tujuan, tahap, file terlibat, dan status per tahap. Kalau satu fitur butuh banyak dokumen, buat folder
`docs/<feature-name>/` dengan `planning/` di dalamnya.

Buat planning file sebelum mulai task besar (lebih dari 1 sub-agent call), dan update status setelah tiap tahap selesai.

---

## Workflow

1. **Baca requirement** dari user atau `docs/planning/`
2. **Baca project-map.md** untuk cari file yang relevan
3. **Buat planning file** di `docs/planning/` jika task multi-step
4. **Spawn sub-agent** dengan prompt yang sudah include path eksak + context cukup
5. **Verifikasi hasil** — cek file yang diubah sebelum lapor ke user
6. **Update planning file** tandai task selesai
7. **Tulis/update lesson SEBELUM push** — lesson dari LESSON REPORT agent ditulis ke lesson file + Lesson Index dulu, ikut di commit yang sama, baru push. Jangan push dengan lesson yang masih menggantung
8. **Delegasi push** via Bash tool (git operations langsung, tanpa spawn agent) — hanya kalau user minta

---

## Sub-Agent Protocols

`react-agent`, `java-backend-agent`, `database-agent`, dan `deploy-agent` semua mengikuti protokol 4-step yang identik:

1. **Step 1** — Baca agent file + lesson files yang relevan (selalu dilakukan pertama)
2. **Step 2** — Report temuan + rencana implementasi ke user, **tunggu konfirmasi** sebelum eksekusi
3. **Step 2b** _(jika confidence < 80%)_ — Minta izin explore satu file per request
4. **Step 3** — Eksekusi hanya setelah konfirmasi eksplisit
5. **Step 4** — Setelah selesai, lapor lesson baru yang ditemukan, tunggu konfirmasi sebelum tulis ke lesson file

**Implikasi untuk prompt orchestrator:**
- Sertakan **exact file path, class name, method name** dari `docs/project-map.md` di setiap prompt
- Tujuan: agent langsung >80% confident → skip Step 2b → hemat 1-2 turn extra
- Jangan tulis "cari sendiri" atau "explore dulu" — itu trigger explore loop yang boros token
- Agent AKAN report dulu sebelum eksekusi — ini by design, jangan di-bypass

**Git ops:** TIDAK di-spawn sebagai sub-agent. Semua git ops dieksekusi langsung via `Bash` tool. Gunakan format commit `<type>(<scope>): <deskripsi>` max 72 char.

---

## DB Schema Freeze

**Status: BELUM AKTIF** — skema awal (V1) masih dibangun. Setelah user menyatakan freeze aktif, berlaku:

**JANGAN** buat atau edit Flyway migration sampai ada pesan eksplisit dari user yang mencabut freeze.

---

## Token Efficiency

- Grep + Read targeted — jangan baca file penuh kalau hanya butuh bagian tertentu
- Sub-agent prompts: sertakan path file eksak dari project-map.md, bukan instruksi "cari sendiri"

---

## Guardrails

Hook di `.claude/settings.json` akan memblokir write berbahaya — pesan error diawali `GUARDRAIL` dan menyebut rule-nya. Jangan bypass.

- `guard-migration.js` — edit migration yang sudah di-commit, tulis ke `db/migration/oracle`
- `check-write.js` — Java: Lombok, `HttpSession`, `@Where`, `hasRole('ROLE_X')` · Migration: tipe Oracle, `IDENTITY`, flag `CHAR(1)`, `FLOAT/DOUBLE` untuk angka bisnis, reserved word PostgreSQL · Frontend: `any`, `fetch` di luar `services/`/`lib/`, password di browser storage

---

## Key Contacts

- Git user: Danang Firmantara (`danangfirmantara837@gmail.com`)
- Repo: https://github.com/DanangFirmantara/kotak-bisnis
- Branch utama: `main` · Branch aktif (tempat push): `development`

---

## App Identity

| Property | Value |
|----------|-------|
| App name | `kotak-bisnis` |
| GroupId | `id.co.kotakbisnis` |
| ArtifactId | `kotak-bisnis-backend` |
| Base package | `id.co.kotakbisnis.dashboard` |
| JAR name | `kotak-bisnis-backend.jar` |
| API prefix | `/api` |
| Backend port | `8080` |
| Vite port | `5173` (proxy `/api` → `8080`) |
| Database | PostgreSQL `localhost:5432`, DB `kotak_bisnis`, user `kotak` (Docker) |
| Env wajib | `JWT_SECRET` (≥32 char), `DB_*` — di `backend/.env` (jangan di-commit) |
| Roles (role-check di kode) | `ADMIN` (= `ROLE_ADMIN`), `USER` (= `ROLE_USER`) |
