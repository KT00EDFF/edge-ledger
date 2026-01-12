'use client'

import { useEffect } from 'react'
import { useNewBet } from '@/lib/new-bet-context'

export default function AiInsightsPanel() {
  const { state, dispatch, toggleAI, selectBet } = useNewBet()

  useEffect(() => {
    if (!state.aiEnabled || !state.selectedMatchup) return

    const fetchPrediction = async () => {
      dispatch({ type: 'SET_AI_LOADING', loading: true })
      try {
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sport: state.selectedSport,
            homeTeam: state.selectedMatchup!.homeTeam.name,
            awayTeam: state.selectedMatchup!.awayTeam.name,
            gameDate: state.selectedMatchup!.startTime
          })
        })

        if (!response.ok) throw new Error('Failed to get prediction')
        
        const data = await response.json()
        dispatch({ type: 'SET_AI_PREDICTION', prediction: data })
      } catch (error) {
        console.error('AI prediction error:', error)
        dispatch({ type: 'SET_AI_PREDICTION', prediction: null })
      } finally {
        dispatch({ type: 'SET_AI_LOADING', loading: false })
      }
    }

    fetchPrediction()
  }, [state.aiEnabled, state.selectedMatchup, state.selectedSport, dispatch])

  const handleApplyBestBet = () => {
    if (!state.aiPrediction?.recommendedBet || !state.selectedMatchup) return
    
    const { recommendedBet } = state.aiPrediction
    
    const matchingOdds = state.odds.find(o => {
      if (recommendedBet.betType === 'moneyline' && o.moneyline) return true
      if (recommendedBet.betType === 'spread' && o.spreads) return true
      if (recommendedBet.betType === 'total' && o.totals) return true
      return false
    })
    
    let odds = -110
    if (matchingOdds) {
      if (recommendedBet.betType === 'moneyline' && matchingOdds.moneyline) {
        odds = matchingOdds.moneyline.home
      } else if (recommendedBet.betType === 'spread' && matchingOdds.spreads) {
        odds = matchingOdds.spreads.home.price
      } else if (recommendedBet.betType === 'total' && matchingOdds.totals) {
        odds = matchingOdds.totals.over.price
      }
    }
    
    selectBet({
      bookmaker: matchingOdds?.bookmaker || 'Best Available',
      betType: recommendedBet.betType,
      selection: recommendedBet.selection,
      line: recommendedBet.line,
      odds
    })
  }

  const getBetTypeLabel = (betType: string) => {
    switch (betType) {
      case 'moneyline': return 'Moneyline'
      case 'spread': return 'Spread'
      case 'total': return 'Over/Under'
      default: return betType
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-title mb-0">AI Analysis</h3>
          <p className="text-text-muted text-sm">GPT-4 powered predictions</p>
        </div>
        <button
          onClick={() => toggleAI(!state.aiEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            state.aiEnabled ? 'bg-accent-green' : 'bg-dark-border'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              state.aiEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {!state.aiEnabled && (
        <div className="text-center py-6">
          <svg className="w-10 h-10 mx-auto mb-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-text-secondary text-sm">Enable AI to get predictions</p>
        </div>
      )}

      {state.aiEnabled && !state.selectedMatchup && (
        <div className="text-center py-6">
          <p className="text-text-secondary text-sm">Select a matchup to analyze</p>
        </div>
      )}

      {state.aiEnabled && state.selectedMatchup && state.aiLoading && (
        <div className="space-y-3">
          <div className="h-4 bg-dark-hover rounded animate-pulse w-3/4" />
          <div className="h-4 bg-dark-hover rounded animate-pulse w-full" />
          <div className="h-4 bg-dark-hover rounded animate-pulse w-2/3" />
        </div>
      )}

      {state.aiEnabled && state.selectedMatchup && state.aiPrediction && !state.aiLoading && (
        <div className="space-y-4">
          {state.aiPrediction.recommendedBet && (
            <button
              onClick={handleApplyBestBet}
              className="w-full p-4 bg-gradient-to-r from-accent-green/20 to-accent-green/10 border border-accent-green/40 rounded-lg hover:border-accent-green transition-colors text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-accent-green font-semibold text-sm uppercase tracking-wide">Best Bet</span>
                </div>
                <span className="text-xs text-text-muted bg-dark-card px-2 py-1 rounded">
                  {getBetTypeLabel(state.aiPrediction.recommendedBet.betType)}
                </span>
              </div>
              <p className="text-white font-bold text-lg mb-1">
                {state.aiPrediction.recommendedBet.selection}
              </p>
              <p className="text-text-secondary text-sm">
                {state.aiPrediction.recommendedBet.reasoning}
              </p>
              <div className="flex items-center gap-1 mt-3 text-accent-green text-sm group-hover:gap-2 transition-all">
                <span>Apply this pick</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          )}

          <div className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
            <div>
              <p className="text-text-muted text-xs">Predicted Winner</p>
              <p className="text-white font-semibold">{state.aiPrediction.predictedWinner}</p>
            </div>
            <div className="text-right">
              <p className="text-text-muted text-xs">Confidence</p>
              <p className={`font-semibold ${
                state.aiPrediction.confidence >= 70 ? 'text-accent-green' :
                state.aiPrediction.confidence >= 50 ? 'text-accent-yellow' : 'text-accent-red'
              }`}>
                {state.aiPrediction.confidence}%
              </p>
            </div>
          </div>

          {state.aiPrediction.predictedScore && (
            <div className="p-3 bg-dark-hover rounded-lg">
              <p className="text-text-muted text-xs mb-2">Predicted Score</p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-white font-bold text-xl">{state.aiPrediction.predictedScore.away}</p>
                  <p className="text-text-secondary text-xs">{state.selectedMatchup.awayTeam.shortName}</p>
                </div>
                <span className="text-text-muted">-</span>
                <div className="text-center">
                  <p className="text-white font-bold text-xl">{state.aiPrediction.predictedScore.home}</p>
                  <p className="text-text-secondary text-xs">{state.selectedMatchup.homeTeam.shortName}</p>
                </div>
              </div>
            </div>
          )}

          {state.aiPrediction.analysis && (
            <div className="p-3 bg-dark-hover rounded-lg">
              <p className="text-text-muted text-xs mb-2">Analysis</p>
              <p className="text-text-secondary text-sm leading-relaxed">{state.aiPrediction.analysis}</p>
            </div>
          )}

          {state.aiPrediction.keyFactors && (
            <div className="p-3 bg-dark-hover rounded-lg">
              <p className="text-text-muted text-xs mb-2">Key Factors</p>
              <ul className="space-y-1">
                {state.aiPrediction.keyFactors.map((factor: string, i: number) => (
                  <li key={i} className="text-text-secondary text-sm flex items-start gap-2">
                    <span className="text-accent-blue mt-1">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
