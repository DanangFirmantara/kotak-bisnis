# Lesson: Routing — React Router 8 (Kotak Bisnis)

> Dari halaman 404/403/health/login (2026-10-23). Sumber kebenaran route: `src/router.tsx`.

## Dua layout: shell vs standalone
- `AppLayout` (path `/`) — sidebar + header + MobileNav: Dashboard, Bantuan, menu "segera hadir", demo 403
- `StandaloneLayout` (**pathless**, tanpa sidebar/header) — `/health`, `/login`, `/akses-ditolak`, dan `*` (404)
- **Jangan pasang guard auth di StandaloneLayout** — `/health` & `/login` harus bisa dibuka tanpa login

## `*` di layout pathless aman
React Router me-ranking route statis/index di atas splat, jadi `*` di StandaloneLayout hanya menangkap path yang
tidak cocok dengan route mana pun (`/asal`, `/a/b`), walau AppLayout punya `path: '/'`. Route statis baru
(`/login`, `/health`) otomatis menang atas `*` — tidak perlu urutan khusus.

## Route "segera hadir" di-generate dari config nav
`appRoutes` = halaman yang sudah dibuat. `comingSoonRoutes` = `ALL_NAV` dikurangi path `appRoutes` → otomatis.
**Tambah halaman menu baru = daftarkan di `appRoutes` saja**; route "segera hadir"-nya hilang sendiri.

## Lazy page
Semua page lewat helper `lazyPage(() => import(...), 'NamedExport')` (React.lazy untuk named export).
`Suspense` ada di masing-masing layout (`RouteFallback`), jadi shell tampil & beranimasi duluan.

## "Halaman sebelumnya" yang aman
`navigate(-1)` saat halaman dibuka langsung (tab baru, tanpa riwayat in-app) bisa keluar dari app. Cek dulu:
```ts
const location = useLocation()
const goBack = () => (location.key === 'default' ? navigate('/') : navigate(-1))
```

## Redirect setelah login / guard
- Setelah login sukses: `navigate('/', { replace: true })` — Back tidak kembali ke form login
- `RequireRole` → `<Navigate to={ACCESS_DENIED_PATH} replace />`; role diambil lewat hook `useCurrentRole()`
  (bukan import mock langsung) supaya nanti cukup ganti isi hook ke JWT
