'use client'

import { useState, useEffect } from 'react'
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

// Mock user data - in production, fetch from user context/session
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
      prediction: prediction.prediction,
      confidence: prediction.confidence,
      aiReasoning: prediction.reasoning,
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Bet</h2>
        <p className="text-gray-600">Review the details before placing your bet</p>
      </div>

      {/* Matchup Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Matchup</h3>
        <p className="text-gray-700">
          {matchup.awayTeam} @ {matchup.homeTeam}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(matchup.gameDate).toLocaleString()}
        </p>
      </div>

      {/* Prediction Summary */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2">AI Prediction</h3>
        <div className="flex justify-between items-center">
          <p className="text-lg font-medium text-gray-900">{prediction.prediction}</p>
          <p className="text-lg font-bold text-blue-600">{prediction.confidence}% Confidence</p>
        </div>
      </div>

      {/* Odds Summary */}
      <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Selected Odds</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-900">{selectedOdds.sportsbook}</p>
            <p className="text-sm text-gray-600">{selectedOdds.betType}</p>
            {selectedOdds.line !== undefined && (
              <p className="text-sm text-gray-600">Line: {selectedOdds.line > 0 ? '+' : ''}{selectedOdds.line}</p>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {selectedOdds.odds > 0 ? '+' : ''}{selectedOdds.odds}
          </p>
        </div>
      </div>

      {/* Bet Size */}
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <h3 className="font-semibold text-gray-900 mb-3">Bet Sizing</h3>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600">Recommended Bet Size</p>
            <p className="font-medium text-gray-900">
              ${recommendedSize.betSize.toFixed(2)} ({recommendedSize.percentage.toFixed(1)}% of bankroll)
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Based on {recommendedSize.method === 'kelly' ? 'Kelly Criterion' : 'confidence level'}
          </p>
        </div>

        <div>
          <label htmlFor="customBetSize" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Bet Size (Optional)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">$</span>
            <input
              type="number"
              id="customBetSize"
              value={customBetSize !== null ? customBetSize : recommendedSize.betSize}
              onChange={(e) => setCustomBetSize(parseFloat(e.target.value) || 0)}
              min={MOCK_USER.minBetSize}
              max={MOCK_USER.maxBetSize}
              step="1"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Min: ${MOCK_USER.minBetSize} | Max: ${MOCK_USER.maxBetSize}
          </p>
        </div>
      </div>

      {/* Payout Summary */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <p className="font-medium text-gray-900">Bet Amount</p>
          <p className="text-lg font-bold text-gray-900">${betSize.toFixed(2)}</p>
        </div>
        <div className="flex justify-between items-center mb-2">
          <p className="font-medium text-gray-900">Potential Payout</p>
          <p className="text-lg font-bold text-green-600">${potentialPayout.toFixed(2)}</p>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-300">
          <p className="font-semibold text-gray-900">Potential Profit</p>
          <p className="text-xl font-bold text-green-600">+${potentialProfit.toFixed(2)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Placing Bet...' : 'Place Bet'}
        </button>
      </div>
    </div>
  )
}
