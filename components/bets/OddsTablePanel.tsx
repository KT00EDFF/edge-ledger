'use client'

import { useEffect } from 'react'
import { useNewBet, OddsData, BetSelection } from '@/lib/new-bet-context'
import { getSportConfig } from '@/lib/sports-mapper'

export default function OddsTablePanel() {
  const { state, dispatch, selectBet } = useNewBet()

  useEffect(() => {
    if (!state.selectedMatchup) return

    const fetchOdds = async () => {
      dispatch({ type: 'SET_ODDS_LOADING', loading: true })
      try {
        const sport = getSportConfig(state.selectedSport)
        if (!sport) throw new Error('Invalid sport')

        const params = new URLSearchParams({
          sport: sport.oddsApiKey,
          homeTeam: state.selectedMatchup!.homeTeam.name,
          awayTeam: state.selectedMatchup!.awayTeam.name
        })

        const response = await fetch(`/api/odds/matchup?${params}`)
        if (!response.ok) throw new Error('Failed to fetch odds')
        
        const data = await response.json()
        dispatch({ type: 'SET_ODDS', odds: data.odds || [] })
      } catch (error) {
        dispatch({ type: 'SET_ODDS_ERROR', error: 'Failed to load odds' })
      } finally {
        dispatch({ type: 'SET_ODDS_LOADING', loading: false })
      }
    }

    fetchOdds()
  }, [state.selectedMatchup, state.selectedSport, dispatch])

  const handleSelectBet = (
    bookmaker: string,
    betType: 'spread' | 'moneyline' | 'total',
    selection: string,
    odds: number,
    line?: number
  ) => {
    selectBet({ bookmaker, betType, selection, odds, line })
  }

  const formatOdds = (odds: number) => {
    if (odds > 0) return `+${odds}`
    return odds.toString()
  }

  if (!state.selectedMatchup) {
    return (
      <div className="card h-full flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <p className="text-text-secondary font-medium">Select a matchup</p>
          <p className="text-text-muted text-sm mt-1">Choose a game to view odds</p>
        </div>
      </div>
    )
  }

  if (state.oddsLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">Odds</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-dark-hover rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (state.oddsError) {
    return (
      <div className="card">
        <p className="text-accent-red text-center">{state.oddsError}</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="section-title mb-1">
          {state.selectedMatchup.awayTeam.shortName} @ {state.selectedMatchup.homeTeam.shortName}
        </h3>
        <p className="text-text-muted text-sm">Select a bet to place</p>
      </div>

      {state.odds.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">No odds available for this matchup</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-2 sm:py-3 px-1 sm:px-2 text-text-secondary text-xs sm:text-sm font-medium">Book</th>
                <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-text-secondary text-xs sm:text-sm font-medium">Spread</th>
                <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-text-secondary text-xs sm:text-sm font-medium">ML</th>
                <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-text-secondary text-xs sm:text-sm font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {state.odds.map((odds: OddsData) => (
                <tr key={odds.bookmaker} className="border-b border-dark-border/50 hover:bg-dark-hover/50">
                  <td className="py-2 sm:py-3 px-1 sm:px-2">
                    <span className="font-medium text-white text-xs sm:text-sm">{odds.bookmaker}</span>
                  </td>
                  <td className="py-1 sm:py-2 px-0.5 sm:px-1">
                    {odds.spreads && (
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleSelectBet(
                            odds.bookmaker,
                            'spread',
                            state.selectedMatchup!.awayTeam.shortName,
                            odds.spreads!.away.price,
                            odds.spreads!.away.point
                          )}
                          className="px-1.5 sm:px-2 py-1 sm:py-1.5 bg-dark-hover border border-dark-border rounded text-[10px] sm:text-xs hover:border-accent-blue transition-colors"
                        >
                          <span className="text-text-secondary">{state.selectedMatchup!.awayTeam.shortName}</span>
                          <span className="ml-1 text-white">{odds.spreads.away.point > 0 ? '+' : ''}{odds.spreads.away.point}</span>
                          <span className="ml-1 text-accent-green">{formatOdds(odds.spreads.away.price)}</span>
                        </button>
                        <button
                          onClick={() => handleSelectBet(
                            odds.bookmaker,
                            'spread',
                            state.selectedMatchup!.homeTeam.shortName,
                            odds.spreads!.home.price,
                            odds.spreads!.home.point
                          )}
                          className="px-1.5 sm:px-2 py-1 sm:py-1.5 bg-dark-hover border border-dark-border rounded text-[10px] sm:text-xs hover:border-accent-blue transition-colors"
                        >
                          <span className="text-text-secondary">{state.selectedMatchup!.homeTeam.shortName}</span>
                          <span className="ml-1 text-white">{odds.spreads.home.point > 0 ? '+' : ''}{odds.spreads.home.point}</span>
                          <span className="ml-1 text-accent-green">{formatOdds(odds.spreads.home.price)}</span>
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-1 sm:py-2 px-0.5 sm:px-1">
                    {odds.moneyline && (
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleSelectBet(
                            odds.bookmaker,
                            'moneyline',
                            state.selectedMatchup!.awayTeam.shortName,
                            odds.moneyline!.away
                          )}
                          className="px-1.5 sm:px-2 py-1 sm:py-1.5 bg-dark-hover border border-dark-border rounded text-[10px] sm:text-xs hover:border-accent-blue transition-colors"
                        >
                          <span className="text-text-secondary">{state.selectedMatchup!.awayTeam.shortName}</span>
                          <span className="ml-1 text-accent-green">{formatOdds(odds.moneyline.away)}</span>
                        </button>
                        <button
                          onClick={() => handleSelectBet(
                            odds.bookmaker,
                            'moneyline',
                            state.selectedMatchup!.homeTeam.shortName,
                            odds.moneyline!.home
                          )}
                          className="px-1.5 sm:px-2 py-1 sm:py-1.5 bg-dark-hover border border-dark-border rounded text-[10px] sm:text-xs hover:border-accent-blue transition-colors"
                        >
                          <span className="text-text-secondary">{state.selectedMatchup!.homeTeam.shortName}</span>
                          <span className="ml-1 text-accent-green">{formatOdds(odds.moneyline.home)}</span>
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-1 sm:py-2 px-0.5 sm:px-1">
                    {odds.totals && (
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleSelectBet(
                            odds.bookmaker,
                            'total',
                            'Over',
                            odds.totals!.over.price,
                            odds.totals!.over.point
                          )}
                          className="px-1.5 sm:px-2 py-1 sm:py-1.5 bg-dark-hover border border-dark-border rounded text-[10px] sm:text-xs hover:border-accent-blue transition-colors"
                        >
                          <span className="text-text-secondary">O</span>
                          <span className="ml-1 text-white">{odds.totals.over.point}</span>
                          <span className="ml-1 text-accent-green">{formatOdds(odds.totals.over.price)}</span>
                        </button>
                        <button
                          onClick={() => handleSelectBet(
                            odds.bookmaker,
                            'total',
                            'Under',
                            odds.totals!.under.price,
                            odds.totals!.under.point
                          )}
                          className="px-1.5 sm:px-2 py-1 sm:py-1.5 bg-dark-hover border border-dark-border rounded text-[10px] sm:text-xs hover:border-accent-blue transition-colors"
                        >
                          <span className="text-text-secondary">U</span>
                          <span className="ml-1 text-white">{odds.totals.under.point}</span>
                          <span className="ml-1 text-accent-green">{formatOdds(odds.totals.under.price)}</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
