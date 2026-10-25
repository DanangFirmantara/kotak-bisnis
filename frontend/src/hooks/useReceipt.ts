import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { receiptService, type SavableTransaction } from '@/services/receipt.service'
import type { ReadReceiptOptions } from '@/types/receipt'

export const receiptKeys = {
  all: ['receipt'] as const,
  templates: () => [...receiptKeys.all, 'templates'] as const,
}

interface ReadReceiptVariables extends ReadReceiptOptions {
  files: File[]
}

/** Baca foto struk (OCR Tesseract.js) → RawReceipt. `onProgress` opsional → progress bar. */
export function useReadReceipt() {
  return useMutation({
    mutationFn: ({ files, onProgress }: ReadReceiptVariables) => receiptService.readReceipt(files, { onProgress }),
  })
}

/** Contoh struk bawaan (mock) — demo tanpa foto. */
export function useReadSampleReceipt() {
  return useMutation({
    mutationFn: (options: ReadReceiptOptions) => receiptService.readSampleReceipt(options),
  })
}

export function useReceiptTemplates() {
  return useQuery({
    queryKey: receiptKeys.templates(),
    queryFn: receiptService.listTemplates,
  })
}

export function useSaveReceiptTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: receiptService.saveTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receiptKeys.templates() }),
  })
}

/** Dummy fase UI. */
export function useSaveTransaction() {
  return useMutation({
    mutationFn: (values: SavableTransaction) => receiptService.saveTransaction(values),
  })
}
