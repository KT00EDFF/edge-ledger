'use client'

import { useState } from 'react'
import { MatchupInput, PredictionResult, OddsData } from '@/types'
import { calculateBetSize, calculatePayout } from '@/lib/bet-sizing'

interface Props {
  matchup: MatchupInput
  prediction: PredictionResult
  selectedOdds: OddsData
  onConfirm: (betDetails: any) => void
  onBack: () => void
  isLoading: boolean
}

const MOCK_USER = {
  id: 'user_mock_id',
  currentBankroll: 1000,
  minBetSize: 10,
  maxBetSize: 500,
  useKellyCriterion: false,
}

export default function BetConfirmation({
  matchup,
  prediction,
  selectedOdds,
  onConfirm,
  onBack,
  isLoading,
}: Props) {
  const [customBetSize, setCustomBetSize] = useState<number | null>(null)

  const recommendedSize = calculateBetSize(
    MOCK_USER.currentBankroll,
    prediction.confidence,
    MOCK_USER.minBetSize,
    MOCK_USER.maxBetSize,
    MOCK_USER.useKellyCriterion,
    selectedOdds.odds
  )

  const betSize = customBetSize !== null ? customBetSize : recommendedSize.betSize
  const potentialPayout = calculatePayout(betSize, selectedOdds.odds)
  const potentialProfit = potentialPayout - betSize

  const handleConfirm = () => {
    const betDetails = {
      userId: MOCK_USER.id,
      sportsbookId: selectedOdds.sportsbookId,
      sport: matchup.sport,
      homeTeam: matchup.homeTeam,
      awayTeam: matchup.awayTeam,
      gameDate: matchup.gameDate,
      prediction: prediction.predictedWinner,
      confidence: prediction.confidence,
      aiReasoning: prediction.analysis,
      betType: selectedOdds.betType,
      odds: selectedOdds.odds,
      oddsDecimal: selectedOdds.oddsDecimal,
      line: selectedOdds.line || null,
      betSize: betSize,
      potentialPayout: potentialPayout,
    }

    onConfirm(betDetails)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Confirm Your Bet</h2>
        <p className="text-text-secondary">Review the details before placing your bet</p>
      </div>

      <div className="bg-dark-hover rounded-xl p-5 border border-dark-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Matchup</h3>
          <span className="badge-blue">{matchup.sport}</span>
        </div>
        <p className="text-lg text-white font-medium">
          {matchup.awayTeam} @ {matchup.homeTeam}
        </p>
        <p className="text-text-muted text-sm mt-1">
          {new Date(matchup.gameDate).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-accent-blue/10 rounded-xl p-5 border border-accent-blue/30">
          <h3 className="font-semibold text-white mb-3">AI Prediction</h3>
          <p className="text-xl font-bold text-white mb-1">{prediction.predictedWinner}</p>
          <p className="text-accent-blue font-semibold">{prediction.confidence}% Confidence</p>
        </div>

        <div className="bg-dark-hover rounded-xl p-5 border border-dark-border">
          <h3 className="font-semibold text-white mb-3">Selected Odds</h3>
          <p className="text-sm text-text-muted">{selectedOdds.sportsbook}</p>
          <p className={`text-2xl font-bold ${selectedOdds.odds > 0 ? 'text-accent-green' : 'text-white'}`}>
            {selectedOdds.odds > 0 ? '+' : ''}{selectedOdds.odds}
          </p>
          {selectedOdds.line !== undefined && (
            <p className="text-text-muted text-sm">Line: {selectedOdds.line > 0 ? '+' : ''}{selectedOdds.line}</p>
          )}
        </div>
      </div>

      <div className="bg-accent-green/10 rounded-xl p-5 border border-accent-green/30">
        <h3 className="font-semibold text-white mb-4">Bet Sizing</h3>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-accent-green/20">
          <div>
            <p className="text-text-secondary text-sm">Recommended Size</p>
            <p className="text-white font-medium">
              ${recommendedSize.betSize.toFixed(2)} ({recommendedSize.percentage.toFixed(1)}% of bankroll)
            </p>
          </div>
          <span className="badge-green text-xs">
            {recommendedSize.method === 'kelly' ? 'Kelly Criterion' : 'Confidence Based'}
          </span>
        </div>

        <div>
          <label htmlFor="customBetSize" className="label-dark">
            Bet Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
            <input
              type="number"
              id="customBetSize"
              value={customBetSize !== null ? customBetSize : recommendedSize.betSize}
              onChange={(e) => setCustomBetSize(parseFloat(e.target.value) || 0)}
              min={MOCK_USER.minBetSize}
              max={MOCK_USER.maxBetSize}
              step="1"
              className="input-dark pl-8"
            />
          </div>
          <p className="text-xs text-text-muted mt-2">
            Min: ${MOCK_USER.minBetSize} | Max: ${MOCK_USER.maxBetSize}
          </p>
        </div>
      </div>

      <div className="bg-dark-hover rounded-xl p-5 border border-dark-border">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Bet Amount</span>
            <span className="text-lg font-bold text-white">${betSize.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Potential Payout</span>
            <span className="text-lg font-bold text-white">${potentialPayout.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-dark-border">
            <span className="text-white font-semibold">Potential Profit</span>
            <span className="text-2xl font-bold text-accent-green">+${potentialProfit.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Placing Bet...</span>
            </span>
          ) : (
            'Place Bet'
          )}
        </button>
      </div>
    </div>
  )
}
