# Lesson: CSS Scoping — Jangan `:root` / reset global di CSS halaman

> Sumber: bug nyata di Undanganku (Next.js). Berlaku juga di Vite SPA.

## Masalahnya
CSS yang di-import di sebuah komponen/halaman **tidak di-unload** saat pindah route di SPA (Vite/React Router maupun
Next.js client navigation). Kalau CSS itu mendefinisikan `:root { --border: ... }` atau `* { margin: 0 }`,
nilainya **bocor ke semua halaman** setelah halaman itu pernah dibuka.

Kasus Undanganku: `landing.css` override `--border` milik shadcn → setelah navigasi ke `/login`, styling login rusak;
hard refresh normal (karena CSS landing tidak ter-load).

## Aturan
1. Token desain & reset global **hanya** di `src/index.css`
2. Jangan override token shadcn (`--border`, `--background`, `--primary`, ...) di file lain
3. Styling khusus halaman → Tailwind class, atau CSS yang di-scope ke class root (`.report-root { ... }`) /
   CSS Modules (`*.module.css`)
4. Nama variabel custom beri prefix (`--report-accent`), jangan bentrok dengan token shadcn

## Token yang dibaca dari JS → `@theme static`
Tailwind v4 hanya meng-emit CSS variable untuk token yang dipakai sebagai class. Token yang dibaca lewat
`var(--color-*)` dari JS (mis. warna Recharts di `chart-utils.ts`) bisa hilang di build → taruh di
`@theme static { ... }` supaya selalu ter-emit. Token mapping shadcn tetap di `@theme inline`.

## `position: fixed` di dalam elemen ber-`transform`
`FadeIn`/motion memberi `transform` pada wrapper-nya → anak `fixed` jadi relatif ke wrapper, bukan viewport
(bottom nav "nyangkut" di tengah halaman). Fix: pasang class `fixed ...` di `FadeIn` itu sendiri
(`<FadeIn className="fixed inset-x-0 bottom-0">`), bukan di anaknya. Berlaku untuk semua elemen dengan
`transform`/`filter`/`backdrop-filter` (glass card juga!).

## `overflow` memotong focus ring & shadow
Stack ikon/list yang diberi `overflow-y-auto` (pengaman layar pendek) ikut memotong ring fokus dan shadow item
di tepinya. Fix: beri `py-*` (dan `w-full`) di dalam container, lalu kompensasi dengan margin (`mt` dikurangi,
`-mb-*`) supaya jarak tampil tetap = token jarak blok. Contoh: nav utama di `components/layout/Sidebar.tsx`.
Scrollbar disembunyikan dengan `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden` — kalau pola ini muncul
lagi (2×), jadikan `@utility no-scrollbar` di `index.css`.

## `transition-*` lewat `cn` menimpa transition bawaan
`cn` (tailwind-merge) menganggap `transition`, `transition-colors`, `transition-shadow` satu grup → menambah
`transition-colors` ke komponen yang base class-nya `transition-shadow` (mis. `GlassCard`) **menghapus**
transition shadow. Untuk animasi bg + border + shadow sekaligus pakai satu class:
`transition-[background-color,border-color,box-shadow]`.

## Kartu mengisi sisa tinggi kolom grid → `flex-1`, bukan `h-full`
Supaya kartu terakhir di kolom pendek sejajar dengan bawah kolom sebelahnya (contoh: kartu "Tentang aplikasi"
di `features/help/components/HelpAside.tsx`):
1. Grid: `lg:items-stretch` (mobile boleh tetap `items-start`)
2. Kolom: `flex flex-col` + `lg:h-full`
3. Wrapper item (`StaggerItem`): `lg:flex lg:flex-1 lg:flex-col` → kartu di dalamnya: `flex flex-1 flex-col`
4. Distribusi isi: footer kartu `mt-auto`

`h-full` pada anak item flex sering tidak bekerja karena tinggi persen butuh tinggi induk yang *definite*.
Kartu yang di-stretch harus diberi isi secukupnya, jangan dibiarkan kosong melompong.

## Ikon overlay di atas teks besar tidak pernah pas di satu glyph
`absolute top-1/2 left-1/2 -translate-1/2` memusatkan ikon ke **seluruh string** ("404"), bukan ke digit "0" —
lebar digit beda, jadi ikon meleset dan menutupi garis angka. Untuk kombinasi ikon + kode, susun **vertikal**
(ikon di atas kode, seperti `StatusView`). Kalau tetap mau di tengah digit: pecah per karakter dan posisikan
ikon (lebih kecil dari lubang digit) relatif ke span digit tengah.

## Cara deteksi
Styling rusak **hanya setelah navigasi**, normal setelah hard refresh → cari CSS import yang punya `:root` / `*` / selector tag global.
