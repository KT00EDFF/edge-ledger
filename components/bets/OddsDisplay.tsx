'use client'

import { useState, useEffect } from 'react'
import { MatchupInput, OddsData } from '@/types'

interface Props {
  matchup: MatchupInput
  onSelect: (odds: OddsData) => void
  onBack: () => void
}

// Mock sportsbooks for now - in production, fetch from user settings
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
      <div className="text-center py-8">
        <p className="text-gray-600">Loading odds...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">{error}</p>
          <p className="text-sm text-yellow-700 mt-2">
            You can still proceed with manual odds entry in the confirmation step.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
          >
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
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Odds</h2>
        <p className="text-gray-600">Select the bet type and sportsbook</p>
      </div>

      {/* Bet Type Selector */}
      <div className="flex gap-2">
        {['Moneyline', 'Spread', 'Total'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedBetType(type)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              selectedBetType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Odds List */}
      <div className="space-y-3">
        {displayOdds.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No odds available for this bet type</p>
        ) : (
          displayOdds.map((odd: OddsData, index: number) => (
            <button
              key={index}
              onClick={() => onSelect(odd)}
              className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{odd.sportsbook}</p>
                  {odd.line !== undefined && (
                    <p className="text-sm text-gray-600">Line: {odd.line > 0 ? '+' : ''}{odd.line}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {odd.odds > 0 ? '+' : ''}{odd.odds}
                  </p>
                  <p className="text-sm text-gray-500">Decimal: {odd.oddsDecimal.toFixed(2)}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  )
}
