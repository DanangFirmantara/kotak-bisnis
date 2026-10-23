import { Info, Mail, MessageCircleQuestion } from 'lucide-react'
import { ActionButton } from '@/components/common/ActionButton'
import { IconCircle } from '@/components/common/IconCircle'
import { InfoRow } from '@/components/common/InfoRow'
import { SectionHeader } from '@/components/common/SectionHeader'
import { StaggerItem } from '@/components/motion/Stagger'
import { GlassCard } from '@/components/ui/GlassCard'
import { APP_NAME } from '@/lib/app-meta'
import { APP_INFO } from '../faq-content'

/** Kolom kiri Bantuan: kartu kontak (highlight) + info aplikasi. Anak langsung `Stagger` di HelpPage. */
export function HelpAside() {
  return (
    <>
      <StaggerItem>
        <GlassCard variant="highlight" className="flex flex-col gap-4 p-5 sm:p-6">
          <IconCircle icon={MessageCircleQuestion} variant="onDark" size="lg" />
          <div>
            <h3 className="text-lg font-bold">Ada pertanyaan lain?</h3>
            <p className="mt-1 text-sm text-white/80">
              Tim kami siap membantu. Kirim pesan dan kami balas dalam {APP_INFO.responseTime}.
            </p>
          </div>
          {/* Fase UI: mailto placeholder — ganti ke kanal bantuan resmi nanti */}
          <ActionButton asChild tone="glass" className="self-start">
            <a href={`mailto:${APP_INFO.contactEmail}`}>
              <Mail aria-hidden />
              Hubungi kami
            </a>
          </ActionButton>
        </GlassCard>
      </StaggerItem>

      {/* lg: regang mengisi sisa tinggi kolom (sejajar bawah FAQ); < lg tinggi natural */}
      <StaggerItem className="lg:flex lg:flex-1 lg:flex-col">
        <GlassCard className="flex flex-1 flex-col gap-4">
          <SectionHeader title="Tentang aplikasi" subtitle={APP_NAME} action={<IconCircle icon={Info} size="sm" />} />
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <InfoRow label="Versi" value={APP_INFO.version} />
            <InfoRow label="Data" value={APP_INFO.dataSource} />
            <InfoRow label="Bahasa" value={APP_INFO.language} />
            <InfoRow label="Terakhir diperbarui" value={APP_INFO.lastUpdated} />
          </dl>

          <div>
            <h4 className="mb-2 px-1 text-xs font-semibold tracking-wider text-ink-muted uppercase">
              Yang bisa kamu lakukan
            </h4>
            <ul className="flex flex-col gap-2 text-sm">
              {APP_INFO.capabilities.map(({ id, icon: Icon, label }) => (
                <li key={id} className="flex items-center gap-3 px-1 text-ink">
                  <Icon aria-hidden className="size-4 shrink-0 text-sage-dark" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-auto border-t border-glass-border pt-3 text-xs text-ink-muted">{APP_INFO.footnote}</p>
        </GlassCard>
      </StaggerItem>
    </>
  )
}
