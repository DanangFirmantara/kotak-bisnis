import { useEffect, useRef, type FormEvent } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { IconButton } from '@/components/common/IconButton'
import { cn } from '@/lib/utils'

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
const SHORTCUT_LABEL = IS_MAC ? '⌘K' : 'Ctrl K'

/** Search pill kaca di header. ⌘K / Ctrl+K memfokuskan input. Pencarian belum aktif (fase UI). */
export function SearchBar({ className }: { className?: string }) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault() // TODO: sambungkan ke fitur pencarian saat tersedia
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        'flex h-12 items-center gap-2 rounded-full border border-glass-border bg-glass-strong pr-1 pl-4 shadow-glass backdrop-blur-xl focus-within:ring-3 focus-within:ring-ring/40',
        className,
      )}
    >
      <Search aria-hidden className="size-4 shrink-0 text-ink-subtle" strokeWidth={1.8} />
      <input
        ref={inputRef}
        type="search"
        placeholder="Cari atau tanya…"
        aria-label="Cari atau tanya"
        // text-base di HP: input < 16px membuat iOS Safari auto-zoom saat fokus
        className="min-w-0 flex-1 bg-transparent text-base text-ink sm:text-sm outline-none placeholder:text-ink-subtle"
      />
      <kbd className="hidden shrink-0 rounded-md border border-glass-line bg-white/70 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-ink-muted sm:inline">
        {SHORTCUT_LABEL}
      </kbd>
      <IconButton icon={Sparkles} label="Tanya" type="submit" variant="dark" />
    </form>
  )
}
