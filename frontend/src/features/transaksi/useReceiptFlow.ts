import { useEffect, useMemo, useRef, useState } from 'react'
import { useReadReceipt, useReadSampleReceipt, useSaveReceiptTemplate } from '@/hooks/useReceipt'
import { receiptService, SAMPLE_RECEIPT_PAGES } from '@/services/receipt.service'
import {
  applyTemplate,
  extractSimple,
  groupLines,
  mergeReceiptPages,
  suggestMappings,
  type SimpleReceipt,
} from '@/lib/receipt'
import type {
  AttachDirection,
  GroupMapping,
  GroupMappings,
  ParsedReceipt,
  RawReceipt,
  ReadProgress,
  ReceiptTemplate,
} from '@/types/receipt'

/** Ringkas (default): nama + harga net + total saja. Lengkap: atur pola struk sendiri (qty, diskon, dll). */
export type ReceiptMode = 'simple' | 'full'

export type StepId = 'upload' | 'raw' | 'pattern' | 'result'

export const STEPS_BY_MODE: Record<ReceiptMode, readonly { id: StepId; label: string }[]> = {
  simple: [
    { id: 'upload', label: 'Upload' },
    { id: 'result', label: 'Hasil' },
  ],
  full: [
    { id: 'upload', label: 'Upload' },
    { id: 'raw', label: 'Teks mentah' },
    { id: 'pattern', label: 'Pola struk' },
    { id: 'result', label: 'Hasil' },
  ],
}

export interface PhotoItem {
  id: string
  file: File
  /** Object URL untuk preview — di-revoke saat foto dibuang / halaman ditutup */
  url: string
}

export interface EditablePage {
  fileName: string
  /** Satu baris per baris teks, bisa diedit user */
  text: string
}

/**
 * State alur 4 langkah halaman Transaksi. Parsing = fungsi murni `lib/receipt`; mutation lewat hooks `useReceipt`.
 * Foto hanya dipreview lokal (object URL), tidak dikirim ke mana pun.
 */
export function useReceiptFlow() {
  const readMutation = useReadReceipt()
  const sampleMutation = useReadSampleReceipt()
  const saveTemplateMutation = useSaveReceiptTemplate()

  const [mode, setMode] = useState<ReceiptMode>('simple')
  const [step, setStep] = useState<StepId>('upload')
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [progress, setProgress] = useState<ReadProgress | null>(null)
  const [progressTotal, setProgressTotal] = useState(0)
  const [pages, setPages] = useState<EditablePage[]>([])
  const [removeOverlap, setRemoveOverlap] = useState(true)
  const [storeName, setStoreName] = useState('')
  const [attach, setAttach] = useState<AttachDirection>('previous')
  const [mappings, setMappings] = useState<GroupMappings>({})
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null)
  const [simple, setSimple] = useState<SimpleReceipt | null>(null)
  /** Naik tiap ekstraksi ulang → form hasil ringkas di-reset dengan data baru */
  const [simpleKey, setSimpleKey] = useState(0)

  const photosRef = useRef(photos)
  useEffect(() => {
    photosRef.current = photos
  }, [photos])
  useEffect(
    () => () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url))
      void receiptService.releaseEngine() // worker OCR dibuat ulang otomatis saat dibutuhkan
    },
    [],
  )

  const merge = useMemo(
    () =>
      mergeReceiptPages(
        pages.map((page) => page.text.split('\n')),
        removeOverlap,
      ),
    [pages, removeOverlap],
  )
  const groups = useMemo(() => groupLines(merge.lines), [merge.lines])

  const addPhotos = (files: File[]) =>
    setPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) })),
    ])

  const removePhoto = (id: string) => {
    const target = photos.find((p) => p.id === id)
    if (target) URL.revokeObjectURL(target.url)
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  const movePhoto = (id: string, offset: -1 | 1) =>
    setPhotos((prev) => {
      const from = prev.findIndex((p) => p.id === id)
      const to = from + offset
      if (from < 0 || to < 0 || to >= prev.length) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      if (moved) next.splice(to, 0, moved)
      return next
    })

  const applyRaw = (raw: RawReceipt) => {
    setPages(raw.pages.map((p) => ({ fileName: p.fileName, text: p.lines.join('\n') })))
    setRemoveOverlap(true)
    setParsed(null)
    if (mode === 'simple') {
      const lines = mergeReceiptPages(
        raw.pages.map((p) => p.lines),
        true,
      ).lines
      setSimple(extractSimple(lines))
      setSimpleKey((key) => key + 1)
      setStep('result')
    } else {
      setStep('raw')
    }
  }

  const readReceipt = () => {
    sampleMutation.reset()
    setProgressTotal(photos.length)
    setProgress({ page: 0, ratio: 0, phase: 'init' })
    readMutation.mutate({ files: photos.map((p) => p.file), onProgress: setProgress }, { onSuccess: applyRaw })
  }

  /** Demo tanpa foto: transkripsi contoh (mock) lewat service yang sama. */
  const readSample = () => {
    readMutation.reset()
    setProgressTotal(SAMPLE_RECEIPT_PAGES)
    setProgress({ page: 0, ratio: 0 })
    sampleMutation.mutate({ onProgress: setProgress }, { onSuccess: applyRaw })
  }

  /** Mode ringkas: ekstrak ulang daftar item dari teks yang sudah dikoreksi (menggantikan hasil sekarang). */
  const reextractSimple = () => {
    setSimple(extractSimple(merge.lines))
    setSimpleKey((key) => key + 1)
  }

  /** Dari hasil ringkas ke alur lengkap (atur pola sendiri). */
  const switchToFull = () => {
    setMode('full')
    setStep('raw')
  }

  const setPageText = (index: number, text: string) =>
    setPages((prev) => prev.map((page, i) => (i === index ? { ...page, text } : page)))

  const goToPattern = () => {
    setMappings((prev) => suggestMappings(groups, prev))
    setStep('pattern')
  }

  const setMapping = (key: string, mapping: GroupMapping) => setMappings((prev) => ({ ...prev, [key]: mapping }))

  const showResult = (nextMappings: GroupMappings = mappings, nextAttach: AttachDirection = attach) => {
    setParsed(applyTemplate(merge.lines, nextMappings, nextAttach))
    setStep('result')
  }

  /** Pakai template toko: isi pola (kelompok baru tanpa template tetap dapat saran) lalu lompat ke hasil. */
  const applySavedTemplate = (template: ReceiptTemplate) => {
    const next = suggestMappings(groups, template.mappings)
    setStoreName(template.storeName)
    setAttach(template.attach)
    setMappings(next)
    showResult(next, template.attach)
  }

  const saveTemplate = () =>
    saveTemplateMutation.mutate({ storeName: storeName.trim(), attach, mappings })

  return {
    mode,
    setMode,
    step,
    setStep,
    photos,
    addPhotos,
    removePhoto,
    movePhoto,
    readReceipt,
    readSample,
    reading: readMutation.isPending || sampleMutation.isPending,
    readError: readMutation.error ?? sampleMutation.error,
    progress,
    progressTotal,
    pages,
    setPageText,
    removeOverlap,
    setRemoveOverlap,
    merge,
    groups,
    goToPattern,
    storeName,
    setStoreName,
    attach,
    setAttach,
    mappings,
    setMapping,
    applySavedTemplate,
    saveTemplate,
    savingTemplate: saveTemplateMutation.isPending,
    templateSaved: saveTemplateMutation.isSuccess,
    showResult,
    parsed,
    simple,
    simpleKey,
    reextractSimple,
    switchToFull,
  }
}

export type ReceiptFlow = ReturnType<typeof useReceiptFlow>
