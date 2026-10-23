/** Identitas aplikasi — satu sumber untuk nama brand, versi, & teks copyright. */
export const APP_NAME = 'Kotak Bisnis'

/** Versi dari package.json, diinjeksi saat build (vite.config.ts `define`). */
export const APP_VERSION: string = __APP_VERSION__

/** Waktu build (ISO 8601) — diinjeksi saat build; di dev = waktu server dev dijalankan. */
export const BUILD_TIME: string = __BUILD_TIME__

/** "© 2026 Copyright by Kotak Bisnis" — tahun ikut tahun berjalan. */
export function getCopyright(year: number = new Date().getFullYear()): string {
  return `© ${year} Copyright by ${APP_NAME}`
}
