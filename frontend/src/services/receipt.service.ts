// Service struk — pure async function. `readReceipt` = OCR asli Tesseract.js di browser (foto TIDAK dikirim ke server);
// `readSampleReceipt` = contoh mock. Template & transaksi masih mock + delay.
// Tahap 3: saveTemplate / saveTransaction → apiFetch ke backend.
import { receiptMock, receiptTemplatesStore } from '@/mocks/receipt'
import { recognizeReceiptPhoto, releaseReceiptEngine } from './receipt-ocr'
import type {
  RawReceipt,
  ReadReceiptOptions,
  ReceiptTemplate,
  SaveTemplateInput,
  SaveTransactionResult,
} from '@/types/receipt'

/** Jumlah foto pada contoh struk bawaan */
export const SAMPLE_RECEIPT_PAGES = receiptMock.pages.length

const MOCK_DELAY_MS = 300
const READ_STEPS = 5
const READ_STEP_MS = 120

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

async function withDelay<T>(data: T, ms: number = MOCK_DELAY_MS): Promise<T> {
  await sleep(ms)
  return structuredClone(data) // cegah komponen memutasi objek mock bersama
}

/** Bentuk minimal transaksi yang bisa disimpan (form mode ringkas maupun lengkap) */
export interface SavableTransaction {
  items: readonly unknown[]
}

export const receiptService = {
  /**
   * OCR asli (Tesseract.js di browser) tiap foto, urut sesuai `files`. Gagal memuat mesin / foto tanpa teks →
   * `ReceiptReadError` (pesan siap tampil). Foto tidak dikirim ke server.
   */
  async readReceipt(files: readonly File[], options: ReadReceiptOptions = {}): Promise<RawReceipt> {
    const pages: RawReceipt['pages'] = []
    for (const [page, file] of files.entries()) {
      pages.push({
        fileName: file.name,
        lines: await recognizeReceiptPhoto(file, page, { onProgress: options.onProgress, readFooter: page === files.length - 1 }),
      })
    }
    return { pages }
  },

  /** Contoh struk (mock transkripsi 2 foto Hari Hari) — demo tanpa foto / tanpa unduh mesin OCR. */
  async readSampleReceipt(options: ReadReceiptOptions = {}): Promise<RawReceipt> {
    for (const [page] of receiptMock.pages.entries()) {
      for (let step = 1; step <= READ_STEPS; step++) {
        await sleep(READ_STEP_MS)
        options.onProgress?.({ page, ratio: step / READ_STEPS })
      }
    }
    return structuredClone(receiptMock)
  },

  /** Bebaskan worker OCR (panggil saat meninggalkan halaman). */
  releaseEngine: releaseReceiptEngine,

  listTemplates: (): Promise<ReceiptTemplate[]> => withDelay(receiptTemplatesStore, 200),

  async saveTemplate(input: SaveTemplateInput): Promise<ReceiptTemplate> {
    await sleep(MOCK_DELAY_MS)
    const existing = receiptTemplatesStore.findIndex(
      (t) => t.storeName.toLowerCase() === input.storeName.toLowerCase(),
    )
    const template: ReceiptTemplate = {
      id: existing >= 0 ? (receiptTemplatesStore[existing]?.id ?? crypto.randomUUID()) : crypto.randomUUID(),
      ...structuredClone(input),
    }
    if (existing >= 0) receiptTemplatesStore[existing] = template
    else receiptTemplatesStore.push(template)
    return structuredClone(template)
  },

  /** Dummy fase UI — tidak menyimpan apa pun. */
  saveTransaction: (values: SavableTransaction): Promise<SaveTransactionResult> =>
    withDelay({ id: `trx-${values.items.length}-${Date.now()}` }, 500),
}
