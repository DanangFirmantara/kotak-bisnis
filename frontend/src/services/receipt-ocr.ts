// Mesin baca struk: Tesseract.js (WASM) di browser. Di-import dinamis → chunk terpisah, tidak masuk bundle awal.
// Satu worker dibuat malas (lazy) dan dipakai ulang antar foto/transaksi. Foto TIDAK dikirim ke server mana pun;
// yang diunduh dari CDN hanya mesin (worker + core WASM) dan model bahasa (di-cache browser setelah pertama kali).
import type { PSM, Worker as TesseractWorker } from 'tesseract.js'
import { isTotalLine } from '@/lib/receipt/extractSimple'
import { preprocessImage } from '@/lib/receipt/preprocess'
import type { ReadProgress } from '@/types/receipt'

/** Indonesia + Inggris: nama produk campur, "TOTAL"/"Debit" dll. */
const LANGUAGES = 'ind+eng'
/** Foto dianggap kosong bila baris bermakna (≥ 4 huruf/angka) kurang dari ini */
const MIN_READABLE_LINES = 3

export class ReceiptReadError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ReceiptReadError'
  }
}

/** Worker + konstanta PSM dari modul yang sama (diambil setelah import dinamis) */
interface Engine {
  worker: TesseractWorker
  psm: typeof PSM
}

let workerPromise: Promise<Engine> | null = null
/** Penerima progres dari logger Tesseract (satu pembaca aktif sekali waktu) */
let loggerSink: ((status: string, progress: number) => void) | null = null

async function createEngine(): Promise<Engine> {
  const tesseract = await import('tesseract.js')
  // CJS: namespace dinamis bisa berisi ekspor langsung atau di bawah `default` — tergantung bundler
  const api = tesseract.default ?? tesseract
  const worker = await api.createWorker(LANGUAGES, api.OEM.LSTM_ONLY, {
    logger: (message) => loggerSink?.(message.status, message.progress),
  })
  await worker.setParameters({
    // PSM 4 (satu kolom teks berukuran variabel): paling stabil untuk struk dibanding PSM 3 dan 6 pada uji foto nyata
    tessedit_pageseg_mode: api.PSM.SINGLE_COLUMN,
    preserve_interword_spaces: '1',
  })
  return { worker, psm: api.PSM }
}

/** Worker bersama. Gagal dimuat (offline, CDN diblokir) → cache dibuang supaya "Coba lagi" benar-benar mencoba ulang. */
function getEngine(): Promise<Engine> {
  workerPromise ??= createEngine().catch((error: unknown) => {
    workerPromise = null
    throw new ReceiptReadError(
      'Mesin baca struk gagal dimuat. Periksa koneksi internet (mesin & model bahasa diunduh sekali, lalu tersimpan) dan coba lagi.',
      { cause: error },
    )
  })
  return workerPromise
}

/** Bebaskan memori worker (mis. saat meninggalkan halaman). Dibuat ulang otomatis saat dibutuhkan. */
export async function releaseReceiptEngine(): Promise<void> {
  const pending = workerPromise
  workerPromise = null
  if (!pending) return
  try {
    await (await pending).worker.terminate()
  } catch {
    // worker sudah gagal dimuat / sudah berhenti — tidak ada yang perlu dibersihkan
  }
}

const isReadable = (line: string) => (line.match(/[\p{L}\p{N}]/gu)?.length ?? 0) >= 4

/** Bagian bawah foto terakhir (pecahan tinggi) yang dibaca ulang khusus untuk TOTAL / metode bayar. */
const FOOTER_REGION = { top: 0.7, bottom: 1 } as const

/**
 * Baca ulang footer saja (crop bawah, grayscale, PSM 6 = satu blok teks — satu-satunya kombinasi yang membaca TOTAL pada foto uji) → baris pembawa TOTAL / pembayaran. Hasil OCR satu halaman
 * sering gagal di footer (miring, gelap); crop kecil jauh lebih andal. Gagal = diabaikan, bukan error.
 */
async function recognizeFooterTotals({ worker, psm }: Engine, file: File): Promise<string[]> {
  try {
    const image = await preprocessImage(file, { mode: 'gray', region: FOOTER_REGION })
    await worker.setParameters({ tessedit_pageseg_mode: psm.SINGLE_BLOCK })
    const { data } = await worker.recognize(image)
    return data.text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && isTotalLine(line))
  } catch {
    return []
  } finally {
    await worker.setParameters({ tessedit_pageseg_mode: psm.SINGLE_COLUMN }).catch(() => undefined)
  }
}

export interface RecognizeOptions {
  onProgress?: (progress: ReadProgress) => void
  /** Foto terakhir struk → baca ulang footer untuk TOTAL */
  readFooter?: boolean
}

/** Foto → baris teks (tanpa baris kosong). `onProgress` dipanggil dengan `phase: 'init'` saat mesin dimuat. */
export async function recognizeReceiptPhoto(file: File, page: number, options: RecognizeOptions = {}): Promise<string[]> {
  const { onProgress, readFooter = false } = options
  onProgress?.({ page, ratio: 0, phase: 'init' })
  const engine = await getEngine()
  const image = await preprocessImage(file)

  loggerSink = (status, progress) => {
    if (status === 'recognizing text') onProgress?.({ page, ratio: progress, phase: 'read' })
  }
  try {
    const { data } = await engine.worker.recognize(image)
    const lines = data.text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    if (lines.filter(isReadable).length < MIN_READABLE_LINES) {
      throw new ReceiptReadError(
        `Foto ${page + 1} tidak berisi teks yang bisa dibaca. Coba foto ulang: lurus dari atas, cahaya terang, teks tajam.`,
      )
    }
    const footer = readFooter ? await recognizeFooterTotals(engine, file) : []
    onProgress?.({ page, ratio: 1, phase: 'read' })
    return [...lines, ...footer]
  } finally {
    loggerSink = null
  }
}
