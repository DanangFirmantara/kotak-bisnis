# Lesson: Parsing Struk Belanja — Kotak Bisnis

> Dari fitur Transaksi (2026-10-25). Logika murni di `src/lib/receipt/`, alur UI di `src/features/transaksi/`.
> Data acuan mock: struk Hari Hari (2 foto) → 47 item, Σ net 1.050.226, Σ qty 58 ("58 ITEMS"), hemat 232.515.

## Dedup overlap antar foto harus fuzzy dan posisional
Akhir foto N dan awal foto N+1 dibaca OCR terpisah → baris yang sama bisa beda sedikit. Cara yang dipakai
(`lib/receipt/dedupOverlap.ts`):
- Normalisasi baris (huruf kecil, buang spasi/tanda baca) lalu kemiripan Levenshtein; satu baris dianggap cocok
  bila ≥ 82%, satu blok dianggap overlap bila ≥ 80% barisnya cocok, overlap minimal 3 baris
- Coba `k` dari terbesar ke terkecil: baris ke-`i` dari `k` baris terakhir foto N dibandingkan dengan baris ke-`i`
  foto N+1. Pencocokan **posisional**, jadi `k` di atas overlap sebenarnya otomatis bergeser dan gagal sendiri —
  tidak perlu heuristik tambahan
- Early-exit begitu jumlah baris tidak cocok melewati batas (biaya tetap kecil untuk puluhan baris)
- Hitung overlap terhadap halaman **asli** sebelumnya (bukan hasil gabungan) dan jalankan dari teks yang sudah
  diedit user, supaya edit tidak hilang saat dedup di-toggle

## Baris yang sama di dalam satu foto bukan duplikat
Item yang sama muncul dua kali (mis. `KISPRAY 250 GOLD`, dan `LENGKENG BKK JM` dengan harga berbeda) adalah baris
sah. Dedup hanya membuang blok overlap **antar foto**, tidak pernah baris sama di dalam satu foto.

## Signature bentuk token saja tidak cukup — tambah keyword
Baris pembayaran `00000305976 Debit QRIS 1,050,226` berbentuk `CODE TEXT MONEY`, persis seperti baris item.
Kunci kelompok = signature + kata kunci (`disc*`, `orig`, `items`, `total`, `debit`, `kredit`, `qris`, `tunai`,
`menghemat`, `kembali`, `ppn`), dicari di segmen TEXT sebagai kata utuh. Risiko yang diterima: nama produk yang
mengandung salah satu kata itu keluar dari kelompok item.

## Angka di nama produk jangan memecah pola
`GENTLE GEN 700 PG`, `MALIA BAKSO SAPI 250` kalau dibiarkan menghasilkan signature berbeda-beda (`CODE TEXT NUM TEXT
MONEY`, `CODE TEXT NUM MONEY`, …) dan tiap varian jadi kelompok baru. Aturan di `tokenize.ts`:
- Baris berbentuk `CODE … MONEY`: semua kata di tengah = satu segmen TEXT
- Baris lain: angka yang diapit dua kata TEXT ikut jadi teks (`LIFEBUOY 800 LF`)
- Angka yang berdiri sendiri (`disc toko 1 -2,930`, `NUM AT MONEY`) tetap token sendiri

## Toleransi noise OCR hanya di konteks angka
Pemisah `,` atau `.`, spasi nyasar (`1,050, 226`), minus terpisah (`- 2,930`). Huruf mirip angka (`O`→0,
`l`/`I`/`|`→1) hanya diganti pada kata yang punya ≥ 1 digit asli **dan** hasilnya benar-benar angka — nama produk
tidak ikut rusak.

## Dedup cadangan: jangkar
Pencocokan posisional gagal bila OCR memecah / menggabung baris berbeda di tiap foto. Cadangan (`findAnchoredOverlap`): baris
panjang (≥ 12 huruf/angka) yang mirip ≥ 85% antar foto jadi "jangkar"; ambil rangkaian terpanjang yang urutannya naik di kedua
foto (LIS), minimal 3 jangkar. Syarat: jangkar terakhir di ujung foto sebelumnya (35% terakhir) dan jangkar pertama di paruh awal
foto berikutnya. Baris yang dibuang = semua baris foto berikutnya s.d. jangkar terakhir.

## Salah baca OCR yang aman dikoreksi di tokenizer
Hanya di konteks sempit, bukan global: `@` dibaca `6`/`8`/`§`/`g` → baris utuh `N <1 karakter> nominal` jadi `N @ nominal`;
koma ribuan hilang (`16000`) → angka 4–7 digit di ujung baris berkode/setelah teks dianggap nominal; kode produk ≥ 4 digit.
Minus hilang (`2.930` untuk `-2,930`) tidak perlu dikoreksi: diskon selalu diambil nilai absolut.

## Mode ringkas: hanya nama + harga net + total
`extractSimple` mengabaikan qty/diskon/rincian/header/footer. Item = baris `[kode] nama nominal` (kode boleh hilang/salah, nominal
di ujung kanan, tanpa keyword disc/orig/total/…). Total = suara terbanyak antar baris TOTAL, metode bayar (Debit/QRIS/…), dan
**footer barcode** (`00008-176053-251026-006758-1,050,226` mengulang total); fallback nominal terbesar di sepertiga bawah.
Nama rusak ≠ item salah: pada foto uji 25 dari 29 item terdeteksi punya subtotal benar walau nama tak terbaca — ukur **nama**
(kemiripan ≥ 80%) dan **nominal** terpisah, jangan satu metrik "false positive".

## Hasil uji OCR foto nyata (Tesseract.js 7, `ind+eng`)
Foto acuan: WhatsApp 720×1280, dipegang tangan, melengkung (struk hanya ±350px lebar → huruf ±8px).
- Foto utuh (tanpa crop): binarisasi **adaptive** jauh lebih baik dari gray/contrast/otsu (22 vs 3–4 item); PSM 4 lebih stabil dan
  cepat dari PSM 3 dan 6; upscale di atas 1500px tidak menolong. Batas utama = resolusi sumber (lebar struk di foto ≥ ~800–1000px)
- Hasil: ±22–29 dari 47 item terdeteksi, subtotal benar ±25, nama ≥ 80% mirip ±12 → hasil WAJIB bisa dikoreksi manual
- **Footer harus dibaca terpisah**: OCR satu halaman sering gagal di footer (miring, gelap). Pass kedua di foto terakhir:
  crop bawah 30%, grayscale, PSM 6 → TOTAL terbaca. Tempelkan **hanya baris keyword** (`isTotalLine`) ke teks utama, supaya item di
  area crop tidak terhitung dua kali. Di crop kecil adaptive justru lebih buruk dari gray
- **OCR ulang yang lebih "detail" tidak otomatis lebih baik** pada sumber beresolusi rendah — diukur lebih buruk: OCR per baris
  (bbox Tesseract, PSM 7, upscale 2–3×) subtotal benar 16–22 vs 25; OCR kolom harga dengan whitelist digit 20–24 (angka salah baca
  membuat Σ meledak). Gabungan 3–6 pass preprocessing: recall naik (nama 20–24, subtotal 32–38) tapi 35–83 item sampah dan 3–6× lebih
  lama. Ukur dulu di foto nyata sebelum mengadopsi

## Cek transkripsi mock
"N ITEMS" di struk = total **qty**, bukan jumlah baris item. Cek yang benar: Σ subtotal net = total struk dan
Σ qty = N. Σ diskon = "Anda Menghemat" juga bisa dipakai untuk memastikan tidak ada diskon yang terlewat.
