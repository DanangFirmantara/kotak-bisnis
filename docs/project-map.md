# Kotak Bisnis — Project Map

Sumber tunggal struktur project untuk orkestrator & agent. **Update setiap ada file/folder/endpoint baru.**
Status: **frontend ✅** (dashboard-ui Tahap 0–6 selesai: foundation, layout shell, semua kartu, responsive + mobile nav, code splitting; + Bantuan, 404/403/segera hadir, /health, /login UI dummy); backend masih target — tandai ✅ saat sudah ada di disk.

---

## Top-Level

```
kotak-bisnis/
├── CLAUDE.md                 # instruksi orkestrator
├── .claude/
│   ├── agents/               # java-backend, react, database, deploy
│   ├── hooks/                # guard-migration.js, check-write.js
│   └── settings.json         # permissions + hooks (shared)
├── backend/                  # Spring Boot (Maven, Java 21)
│   └── lessons/              # lesson backend (jwt-security, database-flyway, local-dev-tooling)
├── frontend/                 # Vite + React + TS (deploy: Cloudflare Workers static assets)
│   ├── .node-version         # 22 — dibaca build Cloudflare
│   ├── wrangler.jsonc        # Workers assets ./dist + SPA fallback (not_found_handling)
│   ├── public/_headers       # /* no-cache (HTML) + /assets/* immutable (! Cache-Control melepas warisan)
│   └── lessons/              # lesson frontend (auth-jwt, api-integration, css-scoping, build-chunking, tooling-setup, routing, responsive-mobile)
├── docs/
│   ├── project-map.md        # ← file ini
│   ├── planning/             # 1 file per fitur/task besar
│   ├── lessons/              # lesson infra (docker-local, deploy-cloudflare)
│   └── _archive-ipa-esetuplimit/   # setting lama, referensi saja
└── docker-compose.yml        # (belum) db + backend/frontend (profile full)
```

---

## Backend (target)

```
backend/src/main/java/id/co/kotakbisnis/dashboard/
├── Application.java
├── config/          SecurityConfig, AuditingConfig, (CorsConfig di dalam SecurityConfig)
├── security/        JwtAuthFilter, JwtService
├── domain/          BaseEntity (7 audit cols), User, Role, ...
├── repository/
├── service/
├── controller/
├── dto/             record request/response
└── exception/       GlobalExceptionHandler, ResourceNotFoundException
backend/src/main/resources/
├── application.yml
└── db/migration/    V1__init_schema.sql, ...
```

## Frontend ✅ (Vite 8 + React 19 + TS 6 strict + Tailwind v4 + shadcn radix-nova)

```
frontend/
├── components.json          # shadcn (style radix-nova, alias @/components, @/lib/utils)
├── vite.config.ts           # @tailwindcss/vite, alias @ → src, port 5173, proxy /api → :8080,
│                            #   define __APP_VERSION__ (package.json, sekarang 0.1.0) + __BUILD_TIME__ (ISO saat build),
│                            #   build.rolldownOptions codeSplitting: vendor-react/ui/motion/charts (lihat komentar prioritas)
├── tsconfig.json / tsconfig.app.json   # paths @/* → ./src/* (tanpa baseUrl — deprecated di TS 6), strict
└── src/
    ├── main.tsx             # QueryClientProvider + TooltipProvider + RouterProvider
    ├── router.tsx           # lihat tabel Route — page via lazyPage() (React.lazy, chunk sendiri); route "segera hadir" di-generate
    │                        #   dari ALL_NAV dikurangi appRoutes (halaman menu baru → daftarkan di appRoutes)
    ├── build-meta.d.ts      # declare __APP_VERSION__ / __BUILD_TIME__ (baca via lib/app-meta.ts)
    ├── index.css            # SATU-SATUNYA tempat token: @theme static (sage, success, danger, ink, glass, canvas, blob, orb, shadow) + token shadcn dipetakan
    ├── components/
    │   ├── ui/              # GlassCard.tsx · shadcn: button.tsx, tooltip.tsx, select.tsx, checkbox.tsx, dropdown-menu.tsx
    │   ├── form/            # FormField, TextField, PasswordField, CheckboxField, FormAlert, field-styles.ts (FIELD_INPUT_CLASS, fieldErrorId)
    │   ├── motion/          # FadeIn.tsx, Stagger.tsx (Stagger + StaggerItem), Tilt.tsx (3D pointer), variants.ts (MOTION, ENTRANCE_DELAY)
    │   ├── common/          # IconButton (+ icon-button-variants.ts), Hint, IconCircle, Avatar, TrendBadge, SectionHeader,
    │   │                    #   Skeleton, StateMessage, GlassSelect, ActionButton (+ action-button-variants.ts),
    │   │                    #   GlassPaymentCard, AssistantOrb, GlassAccordion, StatusView, DashboardLinkButton, InfoRow, StatusDot, AppLogo
    │   ├── auth/            # RequireRole (placeholder guard role → /akses-ditolak; nanti JWT)
    │   ├── dashboard/       # StatCard (+ StatCardSkeleton), MetricChip, QueryState — shared antar kartu dashboard
    │   ├── charts/          # Sparkline, MiniBarChart, LineAreaChart, GaugeChart, ChartTooltip, chart-utils.ts
    │   └── layout/          # AppLayout (+ Suspense route), StandaloneLayout (publik tanpa shell), RouteFallback, Sidebar, MobileNav (< md),
    │                        #   NavIconLink, Header, SearchBar, AppFooter, nav-items.ts (MAIN_NAV/SECONDARY_NAV/ALL_NAV/findNavItem), BackgroundBlobs
    ├── features/
    │   ├── dashboard/       # DashboardPage.tsx (grid bento + Stagger)
    │   │   └── components/  # StatsRow, stat-presets.tsx (StatId → ikon/chart/varian), BalanceCard, EarningsCard, ProfileCard,
    │   │                    #   BusinessCardCard (+ WalletCardStack), TransfersCard (+ TransferItem), SecurityCard
    │   ├── help/            # HelpPage.tsx (Pusat Bantuan: header + 2 kolom lg), faq-content.ts (FAQ_CATEGORIES, APP_INFO — konten statis)
    │   │   └── components/  # HelpAside (kartu highlight "Hubungi kami" mailto placeholder + info aplikasi)
    │   ├── auth/            # LoginPage.tsx (/login: kartu kaca max-w-md + hint akun demo)
    │   │   └── components/  # LoginForm (react-hook-form + loginSchema, Controller untuk checkbox, fieldset disabled saat submit)
    │   ├── coming-soon/     # ComingSoonPage.tsx ("<Menu> segera hadir", label + ikon dari findNavItem(pathname))
    │   ├── errors/          # NotFoundPage.tsx (404: tampilkan path, Dashboard / halaman sebelumnya), AccessDeniedPage.tsx (403),
    │   │                    #   RouteErrorPage.tsx (errorElement root route: error render/chunk usang, Muat ulang + Dashboard)
    │   └── health/          # HealthPage.tsx (/health publik), health-status.ts (HEALTH_STATUS_META, toHealthSummary)
    │       └── components/  # HealthBadge (pill status + dot berdenyut), HealthDetails (+ HealthDetailsSkeleton)
    ├── hooks/useDashboard.ts        # useDashboardData(), slice: useDashboardStats/useEarningsSummary/useOwnerProfile/useInbox/
    │                                #   useBusinessCards/useTransfers/useSecurityStatus
    │                                #   (select di query yang sama, tanpa fetch ganda), useBalanceOverview(period), dashboardKeys
    ├── hooks/useHealth.ts           # useHealth() (staleTime 0, refetchOnMount always), healthKeys
    ├── hooks/useCurrentRole.ts      # role user login — fase UI dari mocks/auth.ts, nanti dari useAuth()
    ├── hooks/useLogout.ts           # () → fungsi keluar: navigate(LOGIN_PATH, replace) + queryClient.clear() (Sidebar & AccountMenu)
    ├── hooks/useLogin.ts            # useMutation(authService.login), sukses → navigate("/", replace) — belum simpan token
    ├── hooks/useCopyToClipboard.ts  # { state: idle|copied|error, copy(text) } — feedback reset 2 dtk
    ├── hooks/useMediaQuery.ts       # useMediaQuery(query) → boolean (useSyncExternalStore) — hanya bila nilai dibutuhkan di JS
    ├── services/dashboard.service.ts # dashboardService.getDashboard(), .getBalance(period) — mock + delay 300ms
    ├── services/health.service.ts   # healthService.getHealth() — APP_VERSION/BUILD_TIME asli + mock, delay 250ms (nanti /api/health)
    ├── services/auth.service.ts     # authService.login(input) — cek DEMO_ACCOUNT, delay 600ms, gagal → ApiError(401); DEMO_LOGIN_HINT (nanti POST /api/auth/login)
    ├── schemas/auth.schema.ts       # loginSchema (email wajib+format, password wajib min 8, remember), LoginInput, PASSWORD_MIN_LENGTH
    ├── mocks/dashboard.ts           # dashboardMock, balanceMock (hanya diimpor service)
    ├── mocks/health.ts              # healthMock (environment, commit, status frontend/backend)
    ├── mocks/auth.ts                # CURRENT_USER_ROLE = OWNER (dummy, diimpor useCurrentRole) · DEMO_ACCOUNT + demoUserMock (diimpor auth.service)
    ├── types/dashboard.ts           # StatSummary, BalanceOverview, EarningsSummary, OwnerProfile (+email, isVerified), BusinessCard (+id),
    │                                #   Transfer, SecurityStatus, InboxSummary, DashboardData (cards: BusinessCard[])
    ├── types/health.ts              # HealthStatus (UP/DOWN/UNKNOWN ala actuator), ComponentHealth, HealthInfo
    ├── types/auth.ts                # UserRole (OWNER/ADMIN/STAFF), AuthUser, LoginResponse
    └── lib/
        ├── chunk-reload.ts  # isChunkLoadError, reloadOnceForStaleChunk (guard sessionStorage), installChunkErrorRecovery (vite:preloadError)
        ├── app-meta.ts      # APP_NAME, APP_VERSION, BUILD_TIME (dari define), getCopyright(year?) — identitas brand satu sumber
        ├── api.ts           # apiFetch<T>, ApiError, clearAuth, TOKEN_KEY/USER_KEY/EXP_KEY (belum dipakai), LOGIN_PATH, getErrorMessage(error, fallback?)
        ├── format.ts        # formatCurrency, formatNumber, formatCompact, formatPercent, formatByKind, formatSignedCurrency,
        │                    #   formatDayTime ("Hari ini, 10.15"), formatDateTime ("23 Okt 2026, 10.15.30"), getInitials, getFirstName
        ├── query-client.ts  # QueryClient (staleTime 60s, retry 1)
        ├── responsive.ts    # MEDIA_QUERY (sm, coarsePointer), TEXT_MICRO/TEXT_NANO (12px HP → 11/10px xl), HIT_AREA (target sentuh ≥40px),
        │                    #   PAGE_GUTTER (gutter layout + safe-area iOS; viewport-fit=cover di index.html)
        └── utils.ts         # cn (re-export paket `cn` dari shadcn)
```

### Route

| Path | Layout | Page | Catatan |
|---|---|---|---|
| `/` | AppLayout | `DashboardPage` | |
| `/bantuan` | AppLayout | `HelpPage` | |
| `/dompet`, `/statistik`, `/laporan`, `/pelanggan`, `/kalender`, `/pengaturan` | AppLayout | `ComingSoonPage` | di-generate dari `ALL_NAV` yang belum ada di `appRoutes` |
| `/akses-ditolak` | StandaloneLayout | `AccessDeniedPage` (403) | tujuan redirect `RequireRole` (`ACCESS_DENIED_PATH`) |
| `/demo-akses-ditolak` | AppLayout | `RequireRole roles={['ADMIN']}` → HelpPage | demo: role dummy OWNER → redirect ke 403 |
| `/login` | StandaloneLayout | `LoginPage` | fase UI: akun demo, belum ada guard — dashboard tetap terbuka tanpa login (TODO ProtectedRoute) |
| `/health` | StandaloneLayout | `HealthPage` | publik, tanpa sidebar/header/login |
| `*` | StandaloneLayout | `NotFoundPage` (404) | tanpa sidebar/header; splat kalah ranking dari route statis |

### Token warna (`src/index.css`, pakai via class Tailwind atau `var(--color-*)`)
`sage-50…300`, `sage` (#7C9A82), `sage-600`, `sage-dark`, `sage-deep` · `success`, `success-soft` · `danger`, `danger-soft` ·
`danger-deep` (teks nominal keluar) · `warning`, `warning-soft`, `warning-deep` (halaman 404) · `ink`, `ink-muted` (#5b6b80, ≥5:1), `ink-subtle` · `orb-blue`, `orb-violet`, `orb-glow` · `glass`, `glass-strong`, `glass-border`, `glass-line` · `canvas-from/via/to` · `blob-mint/sky/peach` ·
shadow `shadow-glass`, `shadow-glass-lg` · font `font-sans` = Plus Jakarta Sans Variable.

### Shared component

| Nama | Lokasi | Props utama |
|---|---|---|
| `GlassCard` | `components/ui/GlassCard.tsx` | `variant?: 'default' \| 'highlight'`, `className`, `children`, + atribut div |
| `FadeIn` | `components/motion/FadeIn.tsx` | `delay?` (detik), `className`, `children` — off saat reduced motion |
| `Stagger` / `StaggerItem` | `components/motion/Stagger.tsx` | `stagger?` (default 0.07s), `delay?`, `className` — anak dibungkus `StaggerItem` |
| `IconButton` | `components/common/IconButton.tsx` | `icon: LucideIcon`, `label` (wajib, aria + tooltip), `variant?: glass\|solid\|dark\|ghost`, `size?: sm\|md\|lg`, `showBadge?`, `tooltipSide?` |
| `iconButtonVariants` | `components/common/icon-button-variants.ts` | cva gaya IconButton — dipakai juga `NavLink` sidebar |
| `Hint` | `components/common/Hint.tsx` | `label`, `side?`, `children` (1 elemen, asChild) — tooltip shadcn |
| `IconCircle` | `components/common/IconCircle.tsx` | `icon`, `label?` (tanpa = dekoratif), `variant?: soft\|dark\|onDark`, `size?` |
| `Skeleton` | `components/common/Skeleton.tsx` | `className` (ukuran/bentuk), `onDark?` — pulse motion-safe |
| `StateMessage` | `components/common/StateMessage.tsx` | `tone: error\|empty`, `title`, `description?`, `onRetry?`, `onDark?` |
| `GlassSelect` | `components/common/GlassSelect.tsx` | generik `value: T`, `onChange(T)`, `options: SelectOption<T>[]`, `label` (aria) — shadcn Select |
| `StatCard` / `StatCardSkeleton` | `components/dashboard/StatCard.tsx` | `label`, `value` (string penuh, jadi title), `compactValue?` (dipakai otomatis saat kolom sempit — container query), `icon?`, `visual?`, `caption?`, `live?`, `variant?` |
| `QueryState` | `components/dashboard/QueryState.tsx` | generik `query` (hasil useQuery), `loading` (skeleton), `loadingLabel`, `error {title, description?}`, `empty? {when(data), title, description?}`, `stateClassName?`, `children(data)` — pola loading/error/empty semua kartu |
| `ActionButton` | `components/common/ActionButton.tsx` | turunan shadcn `Button`: `tone?: sage \| glass`, `asChild?` (mis. `<Link>`), + atribut button — tombol pill aksi kartu |
| `actionButtonVariants` | `components/common/action-button-variants.ts` | cva gaya ActionButton |
| `GlassPaymentCard` | `components/common/GlassPaymentCard.tsx` | `holderName`, `maskedNumber`, `expiry`, `brand`, `showDetails?` (false = kartu belakang), `className`, `style` — visual kartu CSS glass |
| `Tilt` | `components/motion/Tilt.tsx` | `maxTilt?`, `baseRotateX?`, `baseRotateY?`, `perspective?` — 3D miring ikut pointer (spring), reduced motion / `pointer: coarse` = pose diam |
| `ENTRANCE_DELAY` | `components/motion/variants.ts` | urutan masuk: `sidebar` → `header` → `content` → `footer` (detik) |
| `AssistantOrb` | `components/common/AssistantOrb.tsx` | `message?` (bubble), `className` (posisi) — dekorasi aria-hidden, float/glow mati saat reduced motion |
| `GlassAccordion` | `components/common/GlassAccordion.tsx` | `items: GlassAccordionItem[] {id, question, answer: ReactNode, icon?}`, `defaultOpenId?`, `type?: single\|multiple`, `headingAs?: h2\|h3\|h4` — panel GlassCard buka/tutup, animasi tinggi+fade (motion), a11y button/region |
| `MetricChip` | `components/dashboard/MetricChip.tsx` | `label`, `value`, `change?` (TrendBadge), `invertColor?` |
| `AppLayout` | `components/layout/AppLayout.tsx` | layout route: BackgroundBlobs + Sidebar (≥ md) / MobileNav (< md) + Header (FadeIn) + `<Suspense><Outlet/></Suspense>` + AppFooter (FadeIn) |
| `NavIconLink` | `components/layout/NavIconLink.tsx` | `item: NavItem`, `tooltipSide?` — ikon nav aktif/nonaktif, dipakai Sidebar & MobileNav |
| `MobileNav` | `components/layout/MobileNav.tsx` | `className` — bottom nav kaca dari `MAIN_NAV` (posisi fixed diatur AppLayout) |
| `AppFooter` | `components/layout/AppFooter.tsx` | `className?` — footer copyright tipis (`getCopyright()`), dipasang sekali di AppLayout setelah `<main>` |
| `APP_NAME` / `getCopyright` | `lib/app-meta.ts` | nama brand + `© {tahun berjalan} Copyright by Kotak Bisnis` — jangan hardcode nama app di label/brand |
| `MAIN_NAV` / `SECONDARY_NAV` / `ALL_NAV` / `findNavItem` | `components/layout/nav-items.ts` | config `NavItem { label, to, icon }` — tambah menu di sini; `findNavItem(pathname)` → item menu |
| `StandaloneLayout` | `components/layout/StandaloneLayout.tsx` | layout route publik: BackgroundBlobs + konten terpusat (Suspense) + AppFooter, tanpa sidebar/header — dipakai /health + 403/404 |
| `RouteFallback` | `components/layout/RouteFallback.tsx` | fallback Suspense sr-only — dipakai AppLayout & StandaloneLayout |
| `StatusView` | `components/common/StatusView.tsx` | `icon`, `title`, `description`, `code?` ("404"), `tone?: neutral \| warning \| danger`, `detail?`, `actions?` — halaman status (kartu kaca terpusat, FadeIn + Stagger) |
| `DashboardLinkButton` | `components/common/DashboardLinkButton.tsx` | `label?` (default "Kembali ke Dashboard"), `tone?`, `className` — ActionButton + Link `/` |
| `InfoRow` | `components/common/InfoRow.tsx` | `label`, `value: ReactNode`, `valueClassName?` — wajib di dalam `<dl>` (Bantuan, Health) |
| `StatusDot` | `components/common/StatusDot.tsx` | `tone: success \| danger \| muted`, `pulse?` (ping, motion-safe) — dekoratif |
| `RequireRole` | `components/auth/RequireRole.tsx` | `roles: UserRole[]`, `children` — role tak cocok → `<Navigate to="/akses-ditolak" replace>`; placeholder sampai auth JWT |
| `FormField` | `components/form/FormField.tsx` | `id`, `label`, `error?`, `className`, `children` — label → kontrol → pesan error (`fieldErrorId(id)`) |
| `TextField` | `components/form/TextField.tsx` | atribut `<input>` + `label`, `icon?: LucideIcon`, `error?` (aria-invalid/aria-describedby), `trailing?`, `containerClassName?` — kompatibel `{...register()}` (React 19 ref prop) |
| `PasswordField` | `components/form/PasswordField.tsx` | props TextField tanpa `type`/`trailing` — tombol mata IconButton (label berubah) |
| `CheckboxField` | `components/form/CheckboxField.tsx` | props shadcn Checkbox + `label` — dengan RHF pakai `Controller` (`onCheckedChange={(v) => field.onChange(v === true)}`) |
| `FormAlert` | `components/form/FormAlert.tsx` | `message?: string \| null` (kosong = tidak render), `className` — error submit, danger soft, role alert |
| `FIELD_INPUT_CLASS` / `fieldErrorId` | `components/form/field-styles.ts` | gaya input kaca (focus ring sage, aria-invalid danger) + id pesan error |
| `AppLogo` | `components/common/AppLogo.tsx` | `decorative?` (nama app sudah tampil sebagai teks), `className` — IconCircle dark + Boxes (Sidebar, Login) |
| `useLogin` | `hooks/useLogin.ts` | `()` → mutation `{ mutate(LoginInput), isPending, isError, error }`; sukses → `/` |
| `useLogout` | `hooks/useLogout.ts` | `()` → `() => void`; ke `/login` (replace) + clear cache query |
| `useCopyToClipboard` | `hooks/useCopyToClipboard.ts` | `(resetMs?)` → `{ state, copy(text) }` |
| `useMediaQuery` | `hooks/useMediaQuery.ts` | `(query: string)` → `boolean` — pakai `MEDIA_QUERY.*`; layout tetap via class Tailwind (dipakai tinggi chart Saldo, Tilt diam di layar sentuh) |
| `MEDIA_QUERY` / `TEXT_MICRO` / `TEXT_NANO` / `HIT_AREA` / `PAGE_GUTTER` | `lib/responsive.ts` | class/konstanta responsive bersama: teks kecil ≥12px di HP, area sentuh ≥40px tanpa ubah tampilan (sudah di `iconButtonVariants`, GlassSelect, CheckboxField), gutter + safe-area layout |
| `Avatar` | `components/common/Avatar.tsx` | `name`, `size?: sm\|md\|lg` (inisial via `getInitials`), `verified?` (badge centang) |
| `AccountMenu` | `components/common/AccountMenu.tsx` | `className?` — avatar → dropdown kaca: nama+email, `SECONDARY_NAV`, Keluar (`useLogout`). Dipasang di Header, hanya < md |
| `TrendBadge` | `components/common/TrendBadge.tsx` | `value` (%), `invertColor?` (turun = bagus), `onDark?` |
| `SectionHeader` | `components/common/SectionHeader.tsx` | `title`, `subtitle?`, `titleAdornment?`, `action?: ReactNode`, `onDark?` |
| `BackgroundBlobs` | `components/layout/BackgroundBlobs.tsx` | — (fixed, -z-10) |
| `Sparkline` | `components/charts/Sparkline.tsx` | `data: TrendPoint[]`, `height?`, `onDark?`, `formatValue?` |
| `MiniBarChart` | `components/charts/MiniBarChart.tsx` | `data: TrendPoint[]`, `height?`, `highlightIndex?` (default terakhir), `formatValue?` |
| `LineAreaChart` | `components/charts/LineAreaChart.tsx` | generik `data: T[]`, `xKey`, `yKey` (typed key), `height?`, `insetTop?` (ruang chip melayang), `formatValue?`, `formatAxis?` (tanpa ini sumbu Y hidden) |
| `GaugeChart` | `components/charts/GaugeChart.tsx` | `value` (0–100), `caption?` |
| `ChartTooltip` | `components/charts/ChartTooltip.tsx` | dipakai via `<Tooltip content={(p) => <ChartTooltip {...p} formatValue={...} />} />` |
| `CHART_COLORS`, `useSvgId` | `components/charts/chart-utils.ts` | warna chart dari token; id gradient SVG aman |
| shadcn `Tooltip*`, `Button`, `Select*`, `Checkbox`, `DropdownMenu*` | `components/ui/tooltip.tsx`, `button.tsx`, `select.tsx`, `checkbox.tsx`, `dropdown-menu.tsx` | generated — jangan edit manual |


---

## Database

| Versi | File | Isi |
|---|---|---|
| — | — | belum ada |

## API Endpoints

| Method | Path | Role | Keterangan |
|---|---|---|---|
| — | — | — | belum ada |
