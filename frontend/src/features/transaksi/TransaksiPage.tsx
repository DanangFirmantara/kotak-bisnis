import { Stepper } from '@/components/common/Stepper'
import { FadeIn } from '@/components/motion/FadeIn'
import { ENTRANCE_DELAY } from '@/components/motion/variants'
import { PatternStep } from './components/PatternStep'
import { RawTextPanel } from './components/RawTextPanel'
import { RawTextStep } from './components/RawTextStep'
import { ResultStep } from './components/ResultStep'
import { SimpleResultStep } from './components/SimpleResultStep'
import { UploadStep } from './components/UploadStep'
import { STEPS_BY_MODE, useReceiptFlow } from './useReceiptFlow'

/**
 * Transaksi — baca struk belanja. Mode ringkas (default): Upload → Hasil (nama + harga + total).
 * Mode lengkap: Upload → Teks mentah → Pola struk → Hasil. State alur di `useReceiptFlow`;
 * parsing murni di `lib/receipt`; OCR Tesseract.js di browser (foto tidak dikirim ke mana pun).
 */
export function TransaksiPage() {
  const flow = useReceiptFlow()
  const { mode, step, setStep } = flow
  const steps = STEPS_BY_MODE[mode]
  const current = Math.max(0, steps.findIndex((s) => s.id === step))

  return (
    <section aria-labelledby="transaksi-title" className="flex flex-col gap-6">
      <FadeIn delay={ENTRANCE_DELAY.content}>
        <h2 id="transaksi-title" className="text-xl font-bold text-ink">
          Transaksi
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Baca struk belanja dari foto, cek hasilnya terhadap total di struk, dan lihat belanja terbesar.
        </p>
      </FadeIn>

      <FadeIn delay={ENTRANCE_DELAY.content + 0.06}>
        <Stepper steps={steps} current={current} onStepClick={(index) => setStep(steps[index]?.id ?? 'upload')} />
      </FadeIn>

      <FadeIn key={step} delay={step === 'upload' ? ENTRANCE_DELAY.content + 0.12 : 0}>
        {step === 'upload' && <UploadStep {...flow} />}
        {step === 'raw' && <RawTextStep {...flow} onBack={() => setStep('upload')} onNext={flow.goToPattern} />}
        {step === 'pattern' && <PatternStep {...flow} onBack={() => setStep('raw')} onNext={() => flow.showResult()} />}
        {step === 'result' && mode === 'full' && flow.parsed && (
          <ResultStep parsed={flow.parsed} storeName={flow.storeName} onBack={() => setStep('pattern')} />
        )}
        {step === 'result' && mode === 'simple' && flow.simple && (
          <SimpleResultStep
            key={flow.simpleKey}
            simple={flow.simple}
            storeName={flow.storeName}
            rawPanel={<RawTextPanel {...flow} />}
            onBack={() => setStep('upload')}
            onSwitchToFull={flow.switchToFull}
          />
        )}
      </FadeIn>
    </section>
  )
}
