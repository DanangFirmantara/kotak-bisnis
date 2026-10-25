import { Focus, Layers, Ruler, Sun, type LucideIcon } from 'lucide-react'

export interface ReceiptTip {
  id: string
  icon: LucideIcon
  title: string
  description: string
}

/** Tips foto struk (langkah Upload) — konten statis. */
export const RECEIPT_TIPS: readonly ReceiptTip[] = [
  {
    id: 'flat',
    icon: Ruler,
    title: 'Ratakan struk',
    description: 'Jangan terlipat atau kusut — lipatan membuat angka terpotong atau melengkung.',
  },
  {
    id: 'light',
    icon: Sun,
    title: 'Foto lurus dari atas, cahaya terang',
    description: 'Hindari bayangan dan silau supaya semua baris terbaca jelas.',
  },
  {
    id: 'long',
    icon: Layers,
    title: 'Struk panjang? Foto bertahap',
    description:
      'Ambil beberapa bagian berurutan dari atas ke bawah dan sisakan sedikit bagian yang tumpang tindih — duplikatnya dibuang otomatis.',
  },
  {
    id: 'sharp',
    icon: Focus,
    title: 'Teks tajam, lebar struk penuh',
    description: 'Pastikan tidak blur dan seluruh lebar struk masuk dalam frame.',
  },
]
