import { useMemo } from 'react'
import { GlassSelect, type SelectOption } from '@/components/common/GlassSelect'
import { GlassCard } from '@/components/ui/GlassCard'
import {
  analyzeLine,
  defaultSegments,
  LINE_ROLE_LABEL,
  LINE_ROLES,
  SEGMENT_ROLE_LABEL,
  SEGMENT_ROLES_BY_LINE_ROLE,
} from '@/lib/receipt'
import { formatNumber } from '@/lib/format'
import { TEXT_MICRO } from '@/lib/responsive'
import { cn } from '@/lib/utils'
import type { GroupMapping, LineGroup, LineRole, SegmentRole } from '@/types/receipt'

const LINE_ROLE_OPTIONS: SelectOption<LineRole>[] = LINE_ROLES.map((value) => ({
  value,
  label: LINE_ROLE_LABEL[value],
}))

const segmentOptions = (lineRole: LineRole): SelectOption<SegmentRole>[] =>
  SEGMENT_ROLES_BY_LINE_ROLE[lineRole].map((value) => ({ value, label: SEGMENT_ROLE_LABEL[value] }))

export interface PatternGroupCardProps {
  group: LineGroup
  mapping: GroupMapping
  onChange: (mapping: GroupMapping) => void
}

/** Satu kelompok baris berbentuk sama: contoh baris, peran baris, dan peran tiap segmen. */
export function PatternGroupCard({ group, mapping, onChange }: PatternGroupCardProps) {
  const sampleTokens = useMemo(() => analyzeLine(group.samples[0] ?? '').tokens, [group.samples])
  const ignored = mapping.lineRole === 'ignore'

  const changeLineRole = (lineRole: LineRole) =>
    onChange({ lineRole, segments: defaultSegments(lineRole, group.signature, group.keyword) })

  const changeSegment = (index: number, role: SegmentRole) =>
    onChange({ ...mapping, segments: mapping.segments.map((current, i) => (i === index ? role : current)) })

  return (
    <GlassCard className={cn('flex flex-col gap-3 p-4 sm:p-5', ignored && 'opacity-80')}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn(TEXT_MICRO, 'rounded-full bg-sage-50 px-2.5 py-1 font-bold text-sage-deep')}>
          {formatNumber(group.count)} baris
        </span>
        <span className={cn(TEXT_MICRO, 'min-w-0 font-mono break-words text-ink-muted')}>
          {group.signature.join(' · ')}
          {group.keyword && ` · “${group.keyword}”`}
        </span>
      </div>

      <ul className="flex flex-col gap-1 rounded-xl bg-white/60 p-3 ring-1 ring-glass-line">
        {group.samples.map((sample, index) => (
          <li key={`${index}-${sample}`} className="font-mono text-xs break-words text-ink">
            {sample}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-ink-muted">Peran baris</span>
        <GlassSelect
          label="Peran baris"
          value={mapping.lineRole}
          options={LINE_ROLE_OPTIONS}
          onChange={changeLineRole}
          className="w-full sm:w-64"
        />
      </div>

      {!ignored && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sampleTokens.map((token, index) => (
            <div key={`${index}-${token.type}`} className="flex min-w-0 flex-col gap-1.5">
              <span className="truncate text-xs text-ink-muted">
                <span className="font-semibold text-ink">{token.type}</span> · {token.text}
              </span>
              <GlassSelect
                label={`Peran segmen ${token.type} ${token.text}`}
                value={mapping.segments[index] ?? 'ignore'}
                options={segmentOptions(mapping.lineRole)}
                onChange={(role) => changeSegment(index, role)}
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
