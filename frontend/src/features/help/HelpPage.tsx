import { GlassAccordion } from '@/components/common/GlassAccordion'
import { FadeIn } from '@/components/motion/FadeIn'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { ENTRANCE_DELAY } from '@/components/motion/variants'
import { HelpAside } from './components/HelpAside'
import { FAQ_CATEGORIES } from './faq-content'

const FIRST_ITEM_ID = FAQ_CATEGORIES[0]?.items[0]?.id

/**
 * Pusat Bantuan (Q&A statis). Desktop (lg): kiri kartu kontak & info (kartu info diregangkan setinggi kolom FAQ), kanan FAQ per kategori · mobile: 1 kolom.
 * Urutan masuk: judul → kolom kiri → kategori FAQ (stagger). Item pertama kategori pertama terbuka.
 */
export function HelpPage() {
  return (
    <section aria-labelledby="help-title" className="flex flex-col gap-6">
      <FadeIn delay={ENTRANCE_DELAY.content}>
        <h2 id="help-title" className="text-xl font-bold text-ink">
          Pusat Bantuan
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Jawaban singkat seputar Kotak Bisnis — mulai dari fungsi dashboard sampai keamanan akun.
        </p>
      </FadeIn>

      <div className="grid grid-cols-1 items-start gap-6 lg:items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Stagger delay={ENTRANCE_DELAY.content + 0.06} className="flex flex-col gap-4 lg:h-full">
          <HelpAside />
        </Stagger>

        <Stagger delay={ENTRANCE_DELAY.content + 0.12} className="flex flex-col gap-6">
          {FAQ_CATEGORIES.map((category, index) => (
            <StaggerItem key={category.id}>
              <h3 className="mb-3 px-1 text-xs font-semibold tracking-wider text-ink-muted uppercase">
                {category.title}
              </h3>
              <GlassAccordion
                items={category.items}
                headingAs="h4"
                defaultOpenId={index === 0 ? FIRST_ITEM_ID : undefined}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
