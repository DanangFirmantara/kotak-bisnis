# Planning — Transaksi: Baca Struk Belanja

**Tujuan:** halaman `/transaksi` — user upload foto struk belanja (bisa >1 foto untuk struk panjang), app membaca
baris-baris struk, user **memetakan pola struk sendiri** (kolom mana kode / nama produk / harga, dll — tiap toko beda pola),
lalu hasilnya jadi daftar item yang **bisa diedit / ditambah manual**, dicek terhadap TOTAL di struk.

**Scope saat ini:** sampai "baca nilai struk" (Tahap 1–2). Simpan ke DB = Tahap 3, nanti.

Status: ⬜ belum · 🔄 jalan · ✅ selesai

Contoh struk acuan: Hari Hari Pasar Swalayan Buaran, 25/10/26 20:26, 58 item, TOTAL 1.050.226, Debit QRIS,
hemat 232.515 — 2 foto (`C:\Users\Administrator\Downloads\WhatsApp Image 2026-10-25 at 21.04.29.jpeg` = bagian atas,
`...21.04.32.jpeg` = bagian bawah; **tumpang tindih** dari `DOWNY PCH 900 F.L` s.d. `MD SERENA 25G GOLD`).

---

## Alur UI (satu halaman, 4 langkah / stepper)

1. **Upload** — drag & drop / pilih multi-foto (image/*), preview thumbnail, urutkan (atas → bawah), hapus. Tombol "Baca struk".
   Panel **tips foto** dekat dropzone: ratakan struk (jangan terlipat/kusut), foto lurus dari atas & terang, struk panjang
   difoto berurutan dengan sedikit overlap, teks tajam & seluruh lebar struk masuk frame.
2. **Teks mentah** — hasil baca per foto digabung; overlap antar foto dibuang otomatis (deteksi blok baris sama
   terpanjang di akhir foto N vs awal foto N+1), ditandai "duplikat dibuang: N baris" dan bisa dibatalkan.
3. **Pola struk** — baris di-tokenisasi & dikelompokkan berdasarkan **signature bentuk** (urutan jenis token:
   `CODE` digit ≥5, `MONEY` nominal `1,050,226`/`-2,930`, `NUM`, `AT` (@), `TEXT` (kata-kata berurutan digabung jadi 1 segmen), `PCT`, dll).
   Per kelompok tampil: jumlah baris + 1–3 contoh. User pilih:
   - **Peran baris:** Item · Rincian qty×harga · Diskon · Ringkasan (total / jumlah item / metode bayar / tanggal / toko) · Abaikan
   - **Peran tiap segmen** sesuai peran baris (Item: kode, nama, subtotal net · Rincian: qty, harga satuan · Diskon: nominal ·
     Ringkasan: field yang dipilih · lainnya: abaikan)
   - Rincian & Diskon menempel ke **item sebelumnya** (default; opsi "item berikutnya" untuk toko lain)
   - Sistem auto-saran peran untuk pola umum (mis. `CODE TEXT MONEY` → Item, `NUM AT MONEY` → Rincian, teks `disc` → Diskon,
     teks `TOTAL` → Ringkasan) — user tinggal koreksi.
   - Simpan sebagai **template toko** (nama toko) → struk berikutnya bisa pilih template & langsung lompat ke langkah 4.
4. **Hasil** — header (toko, tanggal, metode bayar) + tabel item editable (kode, nama, qty, harga satuan, diskon, subtotal),
   tambah/hapus baris manual. Ringkasan: **total dihitung vs total di struk** → cocok ✅ / selisih ⚠️ (+ baris yang
   subtotal ≠ qty×harga−diskon ditandai). Tombol "Simpan transaksi" = dummy (fase UI).

## Arsitektur (shared-first)

- Logika parsing = **fungsi murni** di `src/lib/receipt/` (tokenize, signature, groupLines, dedupOverlap, applyTemplate,
  validateReceipt) — tanpa React, gampang dites & dipakai ulang saat OCR asli masuk.
- `src/services/receipt.service.ts` — `readReceipt(files) → RawReceipt { pages: { fileName, lines: string[] }[] }`,
  `listTemplates()`, `saveTemplate()`, `saveTransaction()` — fase UI: mock + delay (template disimpan in-memory di mock).
- `src/mocks/receipt.ts` — transkripsi baris kedua foto acuan (termasuk overlap) apa adanya. Kebenaran transkripsi
  dicek: jumlah subtotal item = 1.050.226.
- Hooks TanStack Query/mutation di `src/hooks/useReceipt.ts`. Schema Zod `src/schemas/receipt.schema.ts` untuk form hasil.
- Menu baru **Transaksi** di `MAIN_NAV` (ikon `ReceiptText`), route `/transaksi` di `appRoutes`.

## Tahap

| # | Tahap | Agent | Status |
|---|---|---|---|
| 1a | Types, mock transkripsi struk, `lib/receipt/*` (tokenizer, grouping, dedup overlap, apply template, validasi), service + hooks | react-agent | 🔄 |
| 1b | Halaman `/transaksi`: stepper Upload → Teks mentah → Pola struk → Hasil editable; nav + route; update project-map | react-agent | ✅ |
| 2 | Mesin baca asli (OCR) — **diputuskan: B Tesseract.js** (gratis, jalan di browser, tanpa backend/API key). Isi `readReceipt()` di service diganti Tesseract (lazy-load, worker `ind+eng`), + preprocessing gambar (grayscale, upscale, threshold) dan progress bar. Hasil OCR lebih noisy → tokenizer harus toleran | react-agent | ✅ |
| 2b | **Mode Ringkas** (default): baca hanya nama produk + subtotal net per item + TOTAL dibayar, abaikan baris rincian/diskon/header/footer. OCR per baris (segmentasi + PSM 7, kolom harga whitelist angka). Mode lengkap (Pola struk) tetap sebagai opsi | react-agent | 🔄 |
| 3 | Simpan ke DB (tabel transaksi, transaksi_item, receipt_template) + endpoint | database / java-backend | ⬜ (nanti) |

## Catatan
- Foto tidak diupload ke mana pun di fase UI — hanya `URL.createObjectURL` untuk preview.
- **Keputusan Tahap 2:** OCR pakai **Tesseract.js** (di browser). Tahap 1 sudah disiapkan: `receiptService.readReceipt(files, { onProgress })`
  kontrak tetap; tokenizer toleran noise OCR (pemisah `,`/`.`, spasi nyasar, minus terpisah, O→0 / l,I→1 hanya di kata angka);
  dedup overlap fuzzy (Levenshtein, ≥82% per baris, ≥80% per blok); teks mentah bisa diedit di langkah 2.
- Tahap 1a & 1b selesai: `npm run build` + `oxlint` bersih. Verifikasi logika (skrip esbuild sementara): overlap dibuang 44 baris,
  47 item, Σ net 1.050.226, Σ qty 58, hemat 232.515, 0 baris tidak cocok.
- **Tahap 2 selesai:** `tesseract.js@7.0.0` (pin exact), `services/receipt-ocr.ts` (lazy worker `ind+eng`, PSM 4), `lib/receipt/preprocess.ts`
  (mode adaptive, lebar 1500–2400px), tombol "Coba dengan contoh struk" (`readSampleReceipt`), error → `StateMessage` + retry.
  Uji nyata (Node, foto WhatsApp 720×1280 yang dipegang tangan & melengkung, tanpa crop): ±22 dari 47 item terbaca, 11 benar penuh,
  Σ net terbaca 466.161 dari 1.050.226 → hasil WAJIB dikoreksi manual (langkah 2 & 4). Foto resolusi penuh belum teruji.
  Ide lanjutan: auto-crop area struk, deteksi/koreksi perspektif, self-host worker/core/model di `public/` bila CDN jadi masalah.

## Tahap 2b — Mode Ringkas + grafik (✅)
- **Mode Ringkas (default):** Upload → Hasil. Hanya nama produk + subtotal net per item + total dibayar (`lib/receipt/extractSimple.ts`).
  Qty / diskon / rincian / header / footer diabaikan. **Mode Lengkap** (Teks mentah → Pola struk → Hasil) tetap ada; toggle di langkah Upload,
  tombol "Mode lengkap" di hasil ringkas. Teks hasil baca bisa dikoreksi di panel collapsible lalu "Ekstrak ulang".
- **OCR:** foto terakhir dapat pass kedua khusus footer (crop bawah 30%, grayscale, PSM 6) → TOTAL terbaca walau OCR satu halaman gagal.
- **Grafik "Belanja terbesar":** `HorizontalBarChart` (shared) + `topNWithOthers` (8 teratas + "Lainnya (N item)"), live dari form (useWatch), kedua mode.
- Eksperimen yang TIDAK diadopsi (lebih buruk / terlalu mahal) pada 2 foto acuan: OCR ulang per baris PSM 7 (upscale 2–3×, gray/adaptive) → subtotal benar 16–22 (vs 25);
  OCR ulang kolom harga whitelist digit → 20–24; gabungan 3–6 pass (union) → nama 20–24 / subtotal 32–38 tapi 35–83 item sampah dan 3–6× lebih lama.
- Hasil terukur (foto acuan, node, lihat report): 29 dari 47 item terdeteksi, 25 subtotal benar persis, 12 nama ≥80% mirip, TOTAL 1.050.226 terbaca.
