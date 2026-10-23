import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { ENTRANCE_DELAY } from '@/components/motion/variants'
import { AssistantOrb } from '@/components/common/AssistantOrb'
import { BalanceCard } from './components/BalanceCard'
import { BusinessCardCard } from './components/BusinessCardCard'
import { EarningsCard } from './components/EarningsCard'
import { ProfileCard } from './components/ProfileCard'
import { SecurityCard } from './components/SecurityCard'
import { StatsRow } from './components/StatsRow'
import { TransfersCard } from './components/TransfersCard'

/**
 * Grid bento dashboard:
 *   xl (4 kolom): [4 StatCard] · [Saldo ×2 · Pendapatan · Profil] · [Kartu bisnis ×2 · Transfer · Keamanan]
 *   md–lg (2 kolom): Saldo & Kartu bisnis selebar penuh, kartu lain berpasangan · mobile: 1 kolom.
 * Tiap kartu menangani loading/error/empty sendiri di dalam StaggerItem yang tetap → animasi masuk sekali.
 */
export function DashboardPage() {
  return (
    <section aria-labelledby="dashboard-title">
      <h2 id="dashboard-title" className="sr-only">
        Ringkasan usaha
      </h2>

      <Stagger delay={ENTRANCE_DELAY.content} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsRow />

        {/* relative z-10: orb dekoratif boleh melayang menimpa tepi kartu Pendapatan */}
        <StaggerItem className="relative z-10 md:col-span-2">
          <BalanceCard />
          <AssistantOrb
            message="Saya Sage, asisten dashboard-mu"
            className="absolute top-1/2 -right-12 hidden -translate-y-1/3 xl:block"
          />
        </StaggerItem>
        <StaggerItem>
          <EarningsCard />
        </StaggerItem>
        <StaggerItem>
          <ProfileCard />
        </StaggerItem>

        <StaggerItem className="md:col-span-2">
          <BusinessCardCard />
        </StaggerItem>
        <StaggerItem>
          <TransfersCard />
        </StaggerItem>
        <StaggerItem>
          <SecurityCard />
        </StaggerItem>
      </Stagger>
    </section>
  )
}
