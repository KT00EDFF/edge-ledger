'use client'

import { SUPPORTED_SPORTS } from '@/lib/sports-mapper'
import { useNewBet } from '@/lib/new-bet-context'

export default function SportsSwitcher() {
  const { state, selectSport } = useNewBet()

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {SUPPORTED_SPORTS.map((sport) => (
        <button
          key={sport.key}
          onClick={() => selectSport(sport.key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
            state.selectedSport === sport.key
              ? 'bg-accent-green text-dark-bg'
              : 'bg-dark-hover border border-dark-border text-text-secondary hover:text-white hover:border-accent-blue/50'
          }`}
        >
          <span>{sport.icon}</span>
          <span>{sport.name}</span>
        </button>
      ))}
    </div>
  )
}
