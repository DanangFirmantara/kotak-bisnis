import { useId, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { MOTION } from '@/components/motion/variants'
import { cn } from '@/lib/utils'
import { IconCircle } from './IconCircle'

export interface GlassAccordionItem {
  id: string
  question: string
  answer: ReactNode
  icon?: LucideIcon
}

export interface GlassAccordionProps {
  items: readonly GlassAccordionItem[]
  /** Item yang terbuka saat mount */
  defaultOpenId?: string
  /** `single` = membuka satu menutup yang lain (default) · `multiple` = bebas */
  type?: 'single' | 'multiple'
  /** Level heading pembungkus tombol (sesuaikan hierarki halaman) */
  headingAs?: 'h2' | 'h3' | 'h4'
  className?: string
}

/**
 * Daftar panel kaca buka/tutup (FAQ, detail ringkas). Header = `button` native (Enter/Space bawaan)
 * dengan `aria-expanded`/`aria-controls`; isi = `role="region"`. Animasi tinggi + fade mati saat reduced motion.
 */
export function GlassAccordion({
  items,
  defaultOpenId,
  type = 'single',
  headingAs = 'h3',
  className,
}: GlassAccordionProps) {
  const baseId = useId()
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(
    () => new Set(defaultOpenId ? [defaultOpenId] : []),
  )

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const isOpen = prev.has(id)
      if (type === 'single') return new Set(isOpen ? [] : [id])
      const next = new Set(prev)
      if (isOpen) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {items.map((item) => (
        <AccordionPanel
          key={item.id}
          item={item}
          headingAs={headingAs}
          baseId={`${baseId}-${item.id}`}
          open={openIds.has(item.id)}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </div>
  )
}

interface AccordionPanelProps {
  item: GlassAccordionItem
  headingAs: NonNullable<GlassAccordionProps['headingAs']>
  baseId: string
  open: boolean
  onToggle: () => void
}

function AccordionPanel({ item, headingAs: Heading, baseId, open, onToggle }: AccordionPanelProps) {
  const reduceMotion = useReducedMotion()
  const triggerId = `${baseId}-trigger`
  const regionId = `${baseId}-region`

  const body = (
    // Dengan ikon: ≥ sm jawaban sejajar teks pertanyaan (pl-16); HP pakai lebar penuh supaya baris tidak terlalu sempit
    <div
      className={cn('pr-4 pb-5 text-sm leading-relaxed text-ink-muted sm:pr-5', item.icon ? 'pl-4 sm:pl-16' : 'pl-4 sm:pl-5')}
    >
      {item.answer}
    </div>
  )

  return (
    <GlassCard
      className={cn(
        'p-0 transition-[background-color,border-color,box-shadow] duration-300',
        open ? 'border-sage-300/70 bg-glass-strong shadow-glass-lg' : 'hover:bg-glass-strong',
      )}
    >
      <Heading>
        <button
          type="button"
          id={triggerId}
          aria-expanded={open}
          aria-controls={regionId}
          onClick={onToggle}
          className="flex w-full cursor-pointer items-center gap-3 rounded-3xl px-4 py-4 text-left sm:px-5 focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:outline-none focus-visible:ring-inset"
        >
          {item.icon && <IconCircle icon={item.icon} size="sm" />}
          <span className="min-w-0 flex-1 text-sm font-semibold text-ink">{item.question}</span>
          <ChevronDown
            aria-hidden
            className={cn(
              'size-4 shrink-0 text-ink-muted transition-transform duration-300 motion-reduce:transition-none',
              open && 'rotate-180 text-sage-dark',
            )}
          />
        </button>
      </Heading>

      {reduceMotion ? (
        open && (
          <div id={regionId} role="region" aria-labelledby={triggerId}>
            {body}
          </div>
        )
      ) : (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="region"
              id={regionId}
              role="region"
              aria-labelledby={triggerId}
              className="overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: MOTION.ease }}
            >
              {body}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </GlassCard>
  )
}
