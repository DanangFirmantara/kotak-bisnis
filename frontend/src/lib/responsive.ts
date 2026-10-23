/**
 * Konstanta responsive bersama (HP 360–414px → desktop xl). Satu sumber supaya pola mobile tidak ditambal per halaman.
 * Breakpoint mengikuti default Tailwind (sm 40rem, md 48rem, xl 80rem).
 */

/** Media query untuk `useMediaQuery` — dipakai saat nilai harus di JS (tinggi chart, matikan Tilt). */
export const MEDIA_QUERY = {
  /** ≥ sm (640px) */
  sm: '(min-width: 40rem)',
  /** Pointer utama layar sentuh → efek ikut-pointer (Tilt) dimatikan */
  coarsePointer: '(pointer: coarse)',
} as const

/**
 * Teks keterangan terkecil: 12px di HP/tablet (keterbacaan), kembali 11px / 10px di desktop (xl, desain yang disetujui).
 * Aman dipakai di `cn` (dua-duanya class font-size biasa).
 */
export const TEXT_MICRO = 'text-xs xl:text-[11px]'
export const TEXT_NANO = 'text-xs xl:text-[10px]'

/**
 * Perluas area sentuh jadi minimal 40×40px tanpa mengubah tampilan (pseudo `::after` transparan, terpusat).
 * Untuk kontrol kecil: IconButton sm, trigger GlassSelect, tautan teks, checkbox.
 */
export const HIT_AREA =
  'relative after:absolute after:top-1/2 after:left-1/2 after:size-full after:min-h-10 after:min-w-10 after:-translate-x-1/2 after:-translate-y-1/2'

/**
 * Gutter halaman layout (AppLayout & StandaloneLayout): 16px di HP + aman dari notch (landscape iOS,
 * `viewport-fit=cover` di index.html), 24px mulai lg. Padding bawah diatur masing-masing layout.
 */
export const PAGE_GUTTER =
  'pt-4 pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] lg:p-6'
