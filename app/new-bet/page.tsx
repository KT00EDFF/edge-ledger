'use client'

import { NewBetProvider } from '@/lib/new-bet-context'
import SportsSwitcher from '@/components/bets/SportsSwitcher'
import MatchupScroller from '@/components/bets/MatchupScroller'
import OddsTablePanel from '@/components/bets/OddsTablePanel'
import AiInsightsPanel from '@/components/bets/AiInsightsPanel'
import BetConfirmationModal from '@/components/bets/BetConfirmationModal'

export default function NewBetPage() {
  return (
    <NewBetProvider>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="page-title">New Bet</h1>
          <p className="page-subtitle">Select a matchup and place your bet</p>
        </div>

        <div className="mb-4 sm:mb-6">
          <SportsSwitcher />
        </div>

        <div className="mb-6 sm:mb-8">
          <h2 className="section-title text-base sm:text-lg">Today's Games</h2>
          <MatchupScroller />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <AiInsightsPanel />
          </div>
          <div className="lg:col-span-2 order-1 lg:order-2">
            <OddsTablePanel />
          </div>
        </div>

        <BetConfirmationModal />
      </div>
    </NewBetProvider>
  )
}
