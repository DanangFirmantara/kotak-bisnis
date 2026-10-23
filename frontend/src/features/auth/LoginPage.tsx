import { AppLogo } from '@/components/common/AppLogo'
import { FadeIn } from '@/components/motion/FadeIn'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { ENTRANCE_DELAY, MOTION } from '@/components/motion/variants'
import { GlassCard } from '@/components/ui/GlassCard'
import { APP_NAME } from '@/lib/app-meta'
import { DEMO_LOGIN_HINT } from '@/services/auth.service'
import { LoginForm } from './components/LoginForm'

/** `/login` — di StandaloneLayout (tanpa sidebar/header). Fase UI: akun demo, belum ada auth/UAM. */
export function LoginPage() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <FadeIn delay={ENTRANCE_DELAY.content}>
        <GlassCard className="p-5 sm:p-8">
          <Stagger delay={ENTRANCE_DELAY.content + MOTION.stagger} className="flex flex-col gap-7">
            <StaggerItem className="flex flex-col items-center gap-2 text-center">
              <AppLogo decorative className="mb-1" />
              <p className="text-sm font-semibold text-sage-dark">{APP_NAME}</p>
              <h1 className="text-xl font-bold text-ink">Masuk ke akunmu</h1>
              <p className="text-sm text-ink-muted">Pantau saldo, transaksi, dan laporan bisnismu di satu tempat.</p>
            </StaggerItem>

            <StaggerItem>
              <LoginForm />
            </StaggerItem>
          </Stagger>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={ENTRANCE_DELAY.footer}>
        <p className="text-center text-xs text-ink-muted">{DEMO_LOGIN_HINT}</p>
      </FadeIn>
    </div>
  )
}
