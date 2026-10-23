import { Boxes } from 'lucide-react'
import { APP_NAME } from '@/lib/app-meta'
import { IconCircle } from './IconCircle'

export interface AppLogoProps {
  /** true kalau nama app sudah tampil sebagai teks di dekatnya (logo jadi dekoratif, tidak dibaca dua kali) */
  decorative?: boolean
  className?: string
}

/** Logo brand (lingkaran gelap + ikon Boxes) — satu sumber untuk sidebar & halaman login. */
export function AppLogo({ decorative = false, className }: AppLogoProps) {
  return (
    <IconCircle
      icon={Boxes}
      label={decorative ? undefined : APP_NAME}
      variant="dark"
      size="lg"
      className={className}
    />
  )
}
