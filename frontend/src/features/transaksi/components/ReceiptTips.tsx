import { Lightbulb } from 'lucide-react'
import { GlassAccordion } from '@/components/common/GlassAccordion'
import { IconCircle } from '@/components/common/IconCircle'
import { GlassCard } from '@/components/ui/GlassCard'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { MEDIA_QUERY } from '@/lib/responsive'
import { RECEIPT_TIPS } from '../receipt-tips'

function TipsList() {
  return (
    <ul className="flex flex-col gap-3">
      {RECEIPT_TIPS.map((tip) => (
        <li key={tip.id} className="flex items-start gap-3">
          <IconCircle icon={tip.icon} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{tip.title}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{tip.description}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Tips foto struk: kartu terbuka di ≥ sm, di HP berupa panel yang bisa dilipat (tertutup) agar dropzone tetap di atas. */
export function ReceiptTips() {
  const isWide = useMediaQuery(MEDIA_QUERY.sm)

  if (!isWide) {
    return (
      <GlassAccordion
        headingAs="h3"
        items={[{ id: 'tips', question: 'Tips foto struk', icon: Lightbulb, answer: <TipsList /> }]}
      />
    )
  }

  return (
    <GlassCard className="p-5 sm:p-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
        <Lightbulb aria-hidden strokeWidth={1.8} className="size-4 text-sage-dark" />
        Tips foto struk
      </h3>
      <TipsList />
    </GlassCard>
  )
}
