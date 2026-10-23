/**
 * Blob blur pastel di belakang konten — sumber efek kaca untuk GlassCard.
 * Dipasang sekali di root layout (fixed, di belakang semua, tidak menangkap klik).
 */
export function BackgroundBlobs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-24 size-[420px] rounded-full bg-blob-mint opacity-70 blur-3xl" />
      <div className="absolute top-1/3 -right-32 size-[480px] rounded-full bg-blob-sky opacity-60 blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 size-[380px] rounded-full bg-blob-peach opacity-50 blur-3xl" />
    </div>
  )
}
