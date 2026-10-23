const RELOAD_KEY = 'kb:chunk-reload-at'
/** Reload kedua dalam jendela ini dianggap loop (chunk memang hilang) → berhenti, biarkan error page tampil. */
const RELOAD_WINDOW_MS = 10_000

const CHUNK_ERROR_PATTERN =
  /dynamically imported module|importing a module script failed|not a valid javascript mime type|error loading dynamically imported module|failed to fetch dynamically/i

/** True kalau error berasal dari gagal memuat chunk JS (umumnya hash usang setelah redeploy). */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : ''
  return CHUNK_ERROR_PATTERN.test(message)
}

/**
 * Reload halaman SEKALI untuk mengambil index.html + chunk terbaru. Guard sessionStorage (timestamp)
 * mencegah loop; storage bisa diblokir (private mode) → try/catch, anggap belum pernah reload.
 * @returns true kalau reload dijalankan, false kalau ditahan guard.
 */
export function reloadOnceForStaleChunk(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY))
    if (last && Date.now() - last < RELOAD_WINDOW_MS) return false
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    // storage tidak tersedia → lanjut reload tanpa guard
  }
  window.location.reload()
  return true
}

/** Pasang listener Vite `vite:preloadError` (gagal preload chunk/CSS) → reload sekali. Panggil sekali di main.tsx. */
export function installChunkErrorRecovery() {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadOnceForStaleChunk()) event.preventDefault()
  })
}
