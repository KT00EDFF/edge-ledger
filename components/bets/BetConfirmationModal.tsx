'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNewBet } from '@/lib/new-bet-context'
import { calculateBetSize } from '@/lib/bet-sizing'

interface Settings {
  startingBankroll: number
  currentBankroll: number
  minBetSize: number
  maxBetSize: number
  useKellyCriterion: boolean
}

function loadSettings(): Settings {
  if (typeof window === 'undefined') {
    return {
      startingBankroll: 1000,
      currentBankroll: 1000,
      minBetSize: 10,
      maxBetSize: 500,
      useKellyCriterion: false,
    }
  }
  
  const saved = localStorage.getItem('edgeLedgerSettings')
  if (saved) {
    return JSON.parse(saved)
  }
  return {
    startingBankroll: 1000,
    currentBankroll: 1000,
    minBetSize: 10,
    maxBetSize: 500,
    useKellyCriterion: false,
  }
}

export default function BetConfirmationModal() {
  const router = useRouter()
  const { state, closeConfirmModal, reset } = useNewBet()
  const [betAmount, setBetAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [recommendedBet, setRecommendedBet] = useState<{
    betSize: number
    percentage: number
    method: 'kelly' | 'confidence'
  } | null>(null)

  useEffect(() => {
    const loaded = loadSettings()
    setSettings(loaded)
    
    if (state.betSelection && loaded && loaded.currentBankroll > 0) {
      const confidence = state.aiPrediction?.confidence || 60
      const recommendation = calculateBetSize(
        loaded.currentBankroll,
        confidence,
        loaded.minBetSize,
        loaded.maxBetSize,
        loaded.useKellyCriterion,
        state.betSelection.odds
      )
      if (recommendation.betSize > 0 && !isNaN(recommendation.betSize)) {
        setRecommendedBet(recommendation)
      }
    }
  }, [state.betSelection, state.aiPrediction])

  if (!state.showConfirmModal || !state.betSelection || !state.selectedMatchup) {
    return null
  }

  const calculatePayout = () => {
    const amount = parseFloat(betAmount) || 0
    const odds = state.betSelection!.odds

    if (odds > 0) {
      return amount + (amount * odds / 100)
    } else {
      return amount + (amount * 100 / Math.abs(odds))
    }
  }

  const handleUseRecommended = () => {
    if (recommendedBet) {
      setBetAmount(recommendedBet.betSize.toFixed(2))
    }
  }

  const handleSubmit = async () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      setError('Please enter a valid bet amount')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: state.selectedSport,
          homeTeam: state.selectedMatchup!.homeTeam.name,
          awayTeam: state.selectedMatchup!.awayTeam.name,
          gameDate: state.selectedMatchup!.startTime,
          betType: state.betSelection!.betType,
          selection: state.betSelection!.selection,
          odds: state.betSelection!.odds,
          line: state.betSelection!.line,
          sportsbook: state.betSelection!.bookmaker,
          amount: parseFloat(betAmount),
          potentialPayout: calculatePayout()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to place bet')
      }

      reset()
      router.push('/bets')
    } catch (err) {
      setError('Failed to place bet. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatOdds = (odds: number) => {
    if (odds > 0) return `+${odds}`
    return odds.toString()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={closeConfirmModal} />
      
      <div className="relative bg-dark-card border border-dark-border rounded-xl w-full max-w-md p-4 sm:p-6 mx-2 sm:mx-0">
        <button
          onClick={closeConfirmModal}
          className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Confirm Bet</h2>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-dark-hover rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary text-sm">Matchup</span>
              <span className="text-white font-medium">
                {state.selectedMatchup.awayTeam.shortName} @ {state.selectedMatchup.homeTeam.shortName}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary text-sm">Bet Type</span>
              <span className="text-white font-medium capitalize">{state.betSelection.betType}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary text-sm">Selection</span>
              <span className="text-white font-medium">
                {state.betSelection.selection}
                {state.betSelection.line !== undefined && ` (${state.betSelection.line > 0 ? '+' : ''}${state.betSelection.line})`}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary text-sm">Odds</span>
              <span className="text-accent-green font-bold">{formatOdds(state.betSelection.odds)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">Sportsbook</span>
              <span className="text-white font-medium">{state.betSelection.bookmaker}</span>
            </div>
          </div>

          {recommendedBet && settings && (
            <div className="p-4 bg-accent-blue/10 border border-accent-blue/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-text-secondary text-sm block">Recommended Bet</span>
                  <span className="text-xs text-text-muted">
                    {settings.useKellyCriterion ? 'Kelly Criterion' : 'Confidence-based'} ({recommendedBet.percentage.toFixed(1)}% of bankroll)
                  </span>
                </div>
                <span className="text-accent-blue font-bold text-lg">
                  ${recommendedBet.betSize.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleUseRecommended}
                className="w-full mt-2 py-2 px-4 bg-accent-blue/20 hover:bg-accent-blue/30 border border-accent-blue/50 rounded-lg text-accent-blue text-sm font-medium transition-colors"
              >
                Use Recommended Amount
              </button>
            </div>
          )}

          <div>
            <label className="label-dark">Bet Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="0.00"
                className="input-dark pl-8"
                min="0"
                step="0.01"
              />
            </div>
            {settings && (
              <p className="text-xs text-text-muted mt-1">
                Current bankroll: ${settings.currentBankroll.toFixed(2)}
              </p>
            )}
          </div>

          {betAmount && parseFloat(betAmount) > 0 && (
            <div className="p-4 bg-accent-green/10 border border-accent-green/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Potential Payout</span>
                <span className="text-accent-green font-bold text-lg">
                  ${calculatePayout().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-accent-red/10 border border-accent-red/30 rounded-lg">
              <p className="text-accent-red text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={closeConfirmModal}
            className="btn-secondary flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Placing Bet...' : 'Place Bet'}
          </button>
        </div>
      </div>
    </div>
  )
}
