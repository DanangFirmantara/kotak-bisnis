import { Check } from 'lucide-react'
import { HIT_AREA } from '@/lib/responsive'
import { cn } from '@/lib/utils'

export interface StepperStep {
  id: string
  label: string
}

export interface StepperProps {
  steps: readonly StepperStep[]
  /** Index langkah aktif (0-based) */
  current: number
  /** Langkah yang sudah dilewati bisa diklik untuk kembali; tanpa ini stepper hanya indikator */
  onStepClick?: (index: number) => void
  className?: string
}

/**
 * Indikator langkah horizontal. Di HP hanya nomor + judul langkah aktif (label semua langkah tidak muat di 360px);
 * ≥ sm label tiap langkah tampil. `aria-current="step"` pada langkah aktif.
 */
export function Stepper({ steps, current, onStepClick, className }: StepperProps) {
  return (
    <nav aria-label="Langkah" className={className}>
      <ol className="flex items-center gap-2">
        {steps.map((step, index) => {
          const done = index < current
          const active = index === current
          const clickable = done && onStepClick !== undefined
          const badge = (
            <span
              className={cn(
                'inline-flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                done && 'border-sage bg-sage text-white',
                active && 'border-sage bg-glass-strong text-sage-deep ring-3 ring-sage/25',
                !done && !active && 'border-glass-border bg-glass text-ink-muted',
              )}
            >
              {done ? <Check aria-hidden strokeWidth={2.4} className="size-4" /> : index + 1}
            </span>
          )
          const label = (
            <span
              className={cn(
                'hidden text-sm font-semibold whitespace-nowrap sm:inline',
                active ? 'text-ink' : 'text-ink-muted',
              )}
            >
              {step.label}
            </span>
          )

          return (
            <li
              key={step.id}
              aria-current={active ? 'step' : undefined}
              className={cn('flex min-w-0 items-center gap-2', index < steps.length - 1 && 'sm:flex-1')}
            >
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick(index)}
                  aria-label={`Kembali ke langkah ${index + 1}: ${step.label}`}
                  className={cn(HIT_AREA, 'flex items-center gap-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50')}
                >
                  {badge}
                  {label}
                </button>
              ) : (
                <span className="flex items-center gap-2">
                  {badge}
                  {label}
                </span>
              )}
              {index < steps.length - 1 && (
                <span
                  aria-hidden
                  className={cn('h-0.5 flex-1 rounded-full', done ? 'bg-sage' : 'bg-glass-line')}
                />
              )}
            </li>
          )
        })}
      </ol>
      <p className="mt-2 text-sm font-semibold text-ink sm:hidden">
        Langkah {current + 1} dari {steps.length}: {steps[current]?.label}
      </p>
    </nav>
  )
}
