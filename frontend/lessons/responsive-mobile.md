# Lesson: Responsive Mobile — Kotak Bisnis

> Dari audit responsive semua halaman (2026-10-23), target HP 360–414px (acuan 375×667) + tablet 768px.
> Konstanta shared: `src/lib/responsive.ts` (`TEXT_MICRO`, `TEXT_NANO`, `HIT_AREA`, `PAGE_GUTTER`, `MEDIA_QUERY`),
> hook `src/hooks/useMediaQuery.ts`. Pakai ini — jangan tambal per halaman.

## Checklist tiap halaman/komponen baru
1. Tidak ada horizontal scroll di 360px (`min-w-0`, `truncate`, grid `minmax(0,1fr)`, tanpa lebar tetap besar)
2. Gutter halaman dari `PAGE_GUTTER` (16px + safe-area, 24px di lg)
3. Teks ≥ 12px di HP (`TEXT_MICRO`/`TEXT_NANO` kembali 11/10px di xl)
4. Target sentuh ≥ 40px (`HIT_AREA` untuk kontrol kecil)
5. Konten tidak tertutup MobileNav (padding bawah layout sudah `7rem + safe-area`)
6. Efek khusus pointer (hover, Tilt) aman di layar sentuh

## Input < 16px → iOS Safari auto-zoom
Input form/search wajib `text-base sm:text-sm` (sudah di `FIELD_INPUT_CLASS` & `SearchBar`).

## Safe-area iOS
`env(safe-area-inset-*)` hanya bernilai kalau meta viewport punya `viewport-fit=cover` (sudah di `index.html`).
Setelah itu tangani **semua sisi**: bawah (home indicator → MobileNav `bottom: max(1rem, env(...))`) dan
kiri/kanan (notch saat landscape → `PAGE_GUTTER`).

## Area sentuh tanpa mengubah tampilan
`HIT_AREA` = pseudo `::after` transparan terpusat `min-h-10 min-w-10` → kontrol kecil (IconButton sm, trigger
select, checkbox, tautan teks) tetap kecil secara visual tapi mudah di-tap. Butuh `relative` di elemen.

## Layar sentuh vs mouse
- CSS: varian Tailwind v4 `pointer-fine:` / `pointer-coarse:` (mis. teks "Arahkan kursor…" hanya `pointer-fine:inline`)
- JS: `useMediaQuery(MEDIA_QUERY.coarsePointer)` → `Tilt` diam di layar sentuh

## Elemen melayang di atas chart
Chip/overlay `absolute` di atas chart yang di HP membungkus jadi 2 baris akan menimpa grafik. Di HP taruh di
alur normal (di atas chart), mulai `sm:` baru `sm:absolute` + inset chart. Contoh: `BalanceCard`.

## Susun ulang layout HP tanpa ubah DOM desktop
Pembungkus `contents sm:flex` membuat anak-anaknya ikut grid induk di HP (mis. header 2 baris: sapaan + tombol,
lalu search full width), sementara di sm+ kembali flex seperti desktop. Urutan DOM & aksesibilitas tetap.

## Menu yang hanya ada di satu breakpoint wajib punya padanan
Sidebar (≥ md) berisi Pengaturan, Bantuan, Keluar — di HP sidebar disembunyikan sehingga user **tidak bisa logout**
(bug production 2026-10-23). Setiap menambah aksi/menu di Sidebar, cek padanannya di HP (MobileNav atau
`AccountMenu` di Header). Pakai config & hook bersama (`SECONDARY_NAV`, `useLogout`) supaya tidak terduplikasi.

## Dropdown shadcn dengan trigger kecil
`DropdownMenuContent` default `w-(--radix-dropdown-menu-trigger-width)` → selebar trigger. Untuk trigger kecil
(avatar 40px) timpa lebar (`w-64`) dan beri `collisionPadding` (16) supaya tidak menempel tepi layar HP.

## Jangan taruh padding responsif di base komponen yang sering di-override
`GlassCard` base `p-5`. Kalau base diberi `p-4 sm:p-6`, override pemakai `p-0`/`py-10` lewat `cn` hanya menghapus
`p-4` — `sm:p-6` tetap hidup dan menang di sm+. Padding responsif ditaruh di **pemakai** (`p-5 sm:p-8`).

## Elemen 3D (rotate / translateZ / stack offset) di HP
Bounding box visual **membesar setelah transform**: `rotateX/Y` + perspektif membuat sisi dekat lebih besar, offset
tumpukan (`translate3d`) menambah lebar/tinggi di luar kotak layout. Layout tidak tahu ini → kartu depan menembus
border bawah pembungkus & kartu belakang mepet tepi kanan (bug `WalletCardStack`, iPhone 390px). Aturan:
- Di < sm kecilkan elemen (mis. `max-w-56`), kurangi offset/`translateZ`/sudut rotasi (konstanta terpisah
  `LAYER_MOBILE`/`POSE_MOBILE` + `useMediaQuery(MEDIA_QUERY.sm)`); desktop tetap.
- Beri ruang aman di pembungkus (`pb-8 sm:py-4`) dan jangan andalkan `overflow-hidden` untuk menyembunyikan.
- Offset satu arah membuat visual berat sebelah → geser stack berlawanan arah (`-translate-x-2 sm:translate-x-0`).
