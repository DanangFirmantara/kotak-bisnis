/** Fallback Suspense saat chunk halaman diunduh — shell tetap tampil, skeleton halaman menyusul. */
export function RouteFallback() {
  return (
    <div role="status" className="sr-only">
      Memuat halaman…
    </div>
  )
}
