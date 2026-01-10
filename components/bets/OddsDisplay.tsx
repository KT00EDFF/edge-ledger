'use client'

import { useState, useEffect } from 'react'
import { MatchupInput, OddsData } from '@/types'

interface Props {
  matchup: MatchupInput
  onSelect: (odds: OddsData) => void
  onBack: () => void
}

const MOCK_SPORTSBOOKS = ['draftkings', 'fanduel', 'betmgm']

export default function OddsDisplay({ matchup, onSelect, onBack }: Props) {
  const [odds, setOdds] = useState<OddsData[]>([])
  const [grouped, setGrouped] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBetType, setSelectedBetType] = useState<string>('Moneyline')

  useEffect(() => {
    fetchOdds()
  }, [])

  const fetchOdds = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/odds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: matchup.sport,
          homeTeam: matchup.homeTeam,
          awayTeam: matchup.awayTeam,
          userSportsbooks: MOCK_SPORTSBOOKS,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch odds')
      }

      const data = await response.json()
      setOdds(data.odds)
      setGrouped(data.grouped)
    } catch (err) {
      setError('Failed to fetch odds. The game may not be available yet.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const displayOdds = selectedBetType === 'Moneyline'
    ? grouped.moneyline || []
    : selectedBetType === 'Spread'
    ? grouped.spread || []
    : grouped.total || []

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 border-4 border-dark-border border-t-accent-blue rounded-full animate-spin mb-4"></div>
        <p className="text-text-secondary">Loading odds from sportsbooks...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-accent-yellow/10 border border-accent-yellow/30 rounded-xl p-5">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-accent-yellow flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-accent-yellow font-medium">{error}</p>
              <p className="text-text-secondary text-sm mt-1">
                You can still proceed with manual odds entry in the confirmation step.
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={onBack} className="flex-1 btn-secondary">
            Back
          </button>
          <button
            onClick={() => onSelect({
              sportsbook: 'Manual Entry',
              sportsbookId: 'manual',
              betType: 'Moneyline',
              odds: -110,
              oddsDecimal: 1.91
            })}
            className="flex-1 btn-primary"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Available Odds</h2>
        <p className="text-text-secondary">Select the bet type and sportsbook with the best odds</p>
      </div>

      <div className="flex gap-2 p-1 bg-dark-hover rounded-xl">
        {['Moneyline', 'Spread', 'Total'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedBetType(type)}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              selectedBetType === type
                ? 'bg-accent-blue text-white'
                : 'text-text-muted hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {displayOdds.length === 0 ? (
          <div className="text-center py-12 bg-dark-hover rounded-xl border border-dark-border">
            <svg className="w-12 h-12 text-text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-text-muted">No odds available for this bet type</p>
          </div>
        ) : (
          displayOdds.map((odd: OddsData, index: number) => (
            <button
              key={index}
              onClick={() => onSelect(odd)}
              className="w-full p-4 bg-dark-hover border-2 border-dark-border rounded-xl hover:border-accent-green transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-dark-border rounded-lg flex items-center justify-center font-bold text-white text-sm">
                    {odd.sportsbook.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{odd.sportsbook}</p>
                    {odd.line !== undefined && (
                      <p className="text-sm text-text-muted">Line: {odd.line > 0 ? '+' : ''}{odd.line}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${odd.odds > 0 ? 'text-accent-green' : 'text-white'}`}>
                    {odd.odds > 0 ? '+' : ''}{odd.odds}
                  </p>
                  <p className="text-sm text-text-muted">Decimal: {odd.oddsDecimal.toFixed(2)}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <button onClick={onBack} className="flex-1 btn-secondary">
          Back
        </button>
      </div>
    </div>
  )
}
