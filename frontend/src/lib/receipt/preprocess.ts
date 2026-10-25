// Preprocessing foto struk sebelum OCR (canvas, tanpa library). Langkah piksel = fungsi murni agar bisa diuji di Node.
// Pipeline: upscale bila foto sempit → grayscale → (opsional) regangkan kontras / binarisasi.

export type PreprocessMode = 'gray' | 'contrast' | 'otsu' | 'adaptive'

export interface PreprocessOptions {
  mode?: PreprocessMode
  /** Foto yang lebih sempit dari ini diperbesar (OCR butuh tinggi huruf ≥ ~20px) */
  minWidth?: number
  /** Foto yang lebih lebar dari ini diperkecil (hemat waktu OCR) */
  maxWidth?: number
  /** Ambil sebagian tinggi saja (pecahan 0..1 dari atas); mis. footer: { top: 0.7, bottom: 1 } */
  region?: { top: number; bottom: number }
}

export const PREPROCESS_DEFAULTS = { mode: 'adaptive', minWidth: 1500, maxWidth: 2400 } as const satisfies Omit<Required<PreprocessOptions>, 'region'>

/** Ukuran target: skala naik bila < minWidth, turun bila > maxWidth, selain itu tetap. */
export function scaledSize(
  width: number,
  height: number,
  minWidth: number = PREPROCESS_DEFAULTS.minWidth,
  maxWidth: number = PREPROCESS_DEFAULTS.maxWidth,
): { width: number; height: number } {
  const scale = width < minWidth ? minWidth / width : width > maxWidth ? maxWidth / width : 1
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

/** RGBA → luma 1 kanal (Rec. 601). */
export function toGrayscale(rgba: Uint8ClampedArray): Uint8ClampedArray {
  const gray = new Uint8ClampedArray(rgba.length / 4)
  for (let i = 0; i < gray.length; i++) {
    gray[i] = 0.299 * (rgba[i * 4] ?? 0) + 0.587 * (rgba[i * 4 + 1] ?? 0) + 0.114 * (rgba[i * 4 + 2] ?? 0)
  }
  return gray
}

/** Regangkan histogram: persentil 1% → 0, 99% → 255. */
export function stretchContrast(gray: Uint8ClampedArray): Uint8ClampedArray {
  const histogram = new Uint32Array(256)
  for (const value of gray) histogram[value] = (histogram[value] ?? 0) + 1
  const lowCount = gray.length * 0.01
  const highCount = gray.length * 0.99
  let low = 0
  let high = 255
  let cumulative = 0
  for (let v = 0; v < 256; v++) {
    cumulative += histogram[v] ?? 0
    if (cumulative <= lowCount) low = v
    if (cumulative < highCount) high = v
  }
  const range = Math.max(1, high - low)
  return gray.map((value) => ((value - low) * 255) / range)
}

/** Ambang global Otsu (memaksimalkan varians antar kelas). */
export function otsuThreshold(gray: Uint8ClampedArray): number {
  const histogram = new Uint32Array(256)
  for (const value of gray) histogram[value] = (histogram[value] ?? 0) + 1
  const total = gray.length
  let sumAll = 0
  for (let v = 0; v < 256; v++) sumAll += v * (histogram[v] ?? 0)
  let sumBackground = 0
  let weightBackground = 0
  let best = 0
  let bestVariance = -1
  for (let v = 0; v < 256; v++) {
    weightBackground += histogram[v] ?? 0
    if (weightBackground === 0) continue
    const weightForeground = total - weightBackground
    if (weightForeground === 0) break
    sumBackground += v * (histogram[v] ?? 0)
    const meanBackground = sumBackground / weightBackground
    const meanForeground = (sumAll - sumBackground) / weightForeground
    const variance = weightBackground * weightForeground * (meanBackground - meanForeground) ** 2
    if (variance > bestVariance) {
      bestVariance = variance
      best = v
    }
  }
  return best
}

export function binarize(gray: Uint8ClampedArray, threshold: number): Uint8ClampedArray {
  return gray.map((value) => (value > threshold ? 255 : 0))
}

/**
 * Binarisasi adaptif (rata-rata lokal lewat integral image): tahan terhadap bayangan / cahaya tidak rata di foto struk.
 * Piksel hitam bila lebih gelap dari rata-rata jendela × (1 − bias).
 */
export function adaptiveBinarize(
  gray: Uint8ClampedArray,
  width: number,
  height: number,
  windowSize: number = Math.max(15, Math.round(width / 16)),
  bias = 0.12,
): Uint8ClampedArray {
  const stride = width + 1
  const integral = new Float64Array(stride * (height + 1))
  for (let y = 1; y <= height; y++) {
    let rowSum = 0
    for (let x = 1; x <= width; x++) {
      rowSum += gray[(y - 1) * width + (x - 1)] ?? 0
      integral[y * stride + x] = (integral[(y - 1) * stride + x] ?? 0) + rowSum
    }
  }
  const half = Math.floor(windowSize / 2)
  const out = new Uint8ClampedArray(gray.length)
  for (let y = 0; y < height; y++) {
    const y0 = Math.max(0, y - half)
    const y1 = Math.min(height, y + half + 1)
    for (let x = 0; x < width; x++) {
      const x0 = Math.max(0, x - half)
      const x1 = Math.min(width, x + half + 1)
      const sum =
        (integral[y1 * stride + x1] ?? 0) -
        (integral[y0 * stride + x1] ?? 0) -
        (integral[y1 * stride + x0] ?? 0) +
        (integral[y0 * stride + x0] ?? 0)
      const mean = sum / ((x1 - x0) * (y1 - y0))
      out[y * width + x] = (gray[y * width + x] ?? 0) < mean * (1 - bias) ? 0 : 255
    }
  }
  return out
}

/** Terapkan `mode` pada piksel RGBA (in-place, hasil abu-abu / hitam-putih di ketiga kanal). */
export function enhancePixels(rgba: Uint8ClampedArray, width: number, height: number, mode: PreprocessMode): void {
  let gray = toGrayscale(rgba)
  if (mode === 'contrast' || mode === 'otsu') gray = stretchContrast(gray)
  if (mode === 'otsu') gray = binarize(gray, otsuThreshold(gray))
  if (mode === 'adaptive') gray = adaptiveBinarize(stretchContrast(gray), width, height)
  for (let i = 0; i < gray.length; i++) {
    const value = gray[i] ?? 0
    rgba[i * 4] = value
    rgba[i * 4 + 1] = value
    rgba[i * 4 + 2] = value
    rgba[i * 4 + 3] = 255
  }
}

/**
 * Foto → PNG Blob siap OCR (browser: createImageBitmap + canvas). Orientasi EXIF diikuti.
 * Mode `gray` = hanya grayscale + skala. Gagal decode → lempar Error berbahasa Indonesia.
 */
export async function preprocessImage(file: Blob, options: PreprocessOptions = {}): Promise<Blob> {
  const { mode, minWidth, maxWidth } = { ...PREPROCESS_DEFAULTS, ...options }
  const region = options.region ?? { top: 0, bottom: 1 }
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error('Foto tidak bisa dibuka. Pastikan file berupa gambar (JPG, PNG, WebP).')
  }
  try {
    const sourceY = Math.round(bitmap.height * region.top)
    const sourceHeight = Math.max(1, Math.round(bitmap.height * (region.bottom - region.top)))
    const size = scaledSize(bitmap.width, sourceHeight, minWidth, maxWidth)
    const canvas = document.createElement('canvas')
    canvas.width = size.width
    canvas.height = size.height
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('Browser tidak mendukung pemrosesan gambar.')
    context.imageSmoothingQuality = 'high'
    context.drawImage(bitmap, 0, sourceY, bitmap.width, sourceHeight, 0, 0, size.width, size.height)
    const image = context.getImageData(0, 0, size.width, size.height)
    enhancePixels(image.data, size.width, size.height, mode)
    context.putImageData(image, 0, 0)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Gagal menyiapkan gambar.'))), 'image/png'),
    )
  } finally {
    bitmap.close()
  }
}
