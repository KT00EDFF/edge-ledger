'use client'

import { useEffect, useState, useMemo } from 'react'
import { useNewBet } from '@/lib/new-bet-context'
import { findBestOddsForPick, formatOddsDisplay, BestOddsResult } from '@/lib/best-odds'

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

export default function AiInsightsPanel() {
  const { state, dispatch, toggleAI, selectBet } = useNewBet()
  const [settings, setSettings] = useState<Settings>(loadSettings)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  useEffect(() => {
    if (!state.aiEnabled || !state.selectedMatchup) return

    const fetchPrediction = async () => {
      dispatch({ type: 'SET_AI_LOADING', loading: true })
      dispatch({ type: 'SET_AI_ERROR', error: null })
      
      const requestBody = {
        sport: state.selectedSport,
        homeTeam: state.selectedMatchup!.homeTeam.name,
        awayTeam: state.selectedMatchup!.awayTeam.name,
        gameDate: state.selectedMatchup!.startTime
      }

      console.log('Requesting prediction for:', requestBody)
      
      try {
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })

        const data = await response.json()
        console.log('Prediction response:', data)

        if (!response.ok) {
          const errorMsg = getErrorMessage(data.errorType, data.error, data.details)
          throw new Error(errorMsg)
        }
        
        dispatch({ type: 'SET_AI_PREDICTION', prediction: data })
      } catch (error) {
        console.error('AI prediction error:', error)
        dispatch({ 
          type: 'SET_AI_ERROR', 
          error: error instanceof Error ? error.message : 'Failed to get prediction' 
        })
        dispatch({ type: 'SET_AI_PREDICTION', prediction: null })
      } finally {
        dispatch({ type: 'SET_AI_LOADING', loading: false })
      }
    }

    fetchPrediction()
  }, [state.aiEnabled, state.selectedMatchup, state.selectedSport, dispatch])

  const bestOdds = useMemo<BestOddsResult | null>(() => {
    if (!state.aiPrediction?.recommendedBet || !state.selectedMatchup || state.odds.length === 0) {
      return null
    }

    return findBestOddsForPick(
      state.aiPrediction.recommendedBet,
      state.odds,
      state.selectedMatchup.homeTeam.name,
      state.selectedMatchup.awayTeam.name,
      state.aiPrediction.confidence,
      settings.currentBankroll,
      settings.minBetSize,
      settings.maxBetSize,
      settings.useKellyCriterion,
      state.selectedMatchup.homeTeam.shortName,
      state.selectedMatchup.awayTeam.shortName
    )
  }, [state.aiPrediction, state.selectedMatchup, state.odds, settings])

  const getErrorMessage = (type: string, message: string, details?: string): string => {
    switch (type) {
      case 'quota_exceeded':
        return 'Google API quota exhausted. Check your quota at console.cloud.google.com'
      case 'api_key_missing':
        return 'Google API key not configured. Add GOOGLE_API_KEY in Settings > Secrets'
      case 'parse_error':
        return 'AI returned an invalid response. Try again.'
      default:
        return details ? `${message}: ${details}` : message
    }
  }

  const handleApplyBestBet = () => {
    if (!bestOdds) return
    
    selectBet({
      bookmaker: bestOdds.bookmaker,
      betType: bestOdds.betType,
      selection: bestOdds.selection,
      odds: bestOdds.odds,
      line: bestOdds.line
    })
  }

  const getBetTypeLabel = (betType: string) => {
    switch (betType) {
      case 'moneyline': return 'ML'
      case 'spread': return 'SPR'
      case 'total': return 'O/U'
      default: return betType
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-accent-green'
    if (confidence >= 55) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 70) return 'bg-accent-green/20 border-accent-green/40'
    if (confidence >= 55) return 'bg-yellow-400/20 border-yellow-400/40'
    return 'bg-red-400/20 border-red-400/40'
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Sharp Analysis</h3>
          <p className="text-text-muted text-xs">AI-powered edge detection</p>
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
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-dark-hover flex items-center justify-center">
            <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-text-secondary text-sm">Enable AI for sharp betting insights</p>
        </div>
      )}

      {state.aiEnabled && !state.selectedMatchup && (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-dark-hover flex items-center justify-center">
            <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <p className="text-text-secondary text-sm">Select a matchup to analyze</p>
        </div>
      )}

      {state.aiEnabled && state.selectedMatchup && state.aiLoading && (
        <div className="py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-center text-text-secondary text-sm">Analyzing matchup...</p>
          <p className="text-center text-text-muted text-xs mt-1">
            {state.selectedMatchup.awayTeam.name} @ {state.selectedMatchup.homeTeam.name}
          </p>
        </div>
      )}

      {state.aiEnabled && state.selectedMatchup && state.aiError && !state.aiLoading && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-400 font-medium text-sm">Analysis Failed</p>
              <p className="text-text-secondary text-xs mt-1">{state.aiError}</p>
            </div>
          </div>
        </div>
      )}

      {state.aiEnabled && state.selectedMatchup && state.aiPrediction && !state.aiLoading && (
        <div className="space-y-4">
          {state.aiPrediction.recommendedBet && (
            <button
              onClick={handleApplyBestBet}
              disabled={!bestOdds}
              className="w-full p-4 bg-gradient-to-br from-accent-green/15 to-transparent border border-accent-green/30 rounded-xl hover:border-accent-green/60 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent-green/20 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-accent-green font-bold text-xs uppercase tracking-wider">Best Bet</span>
                </div>
                <span className="text-[10px] text-text-muted bg-dark-card/80 px-2 py-0.5 rounded-full border border-dark-border">
                  {getBetTypeLabel(state.aiPrediction.recommendedBet.betType)}
                </span>
              </div>
              
              {bestOdds ? (
                <>
                  <p className="text-white font-bold text-lg mb-1">
                    {bestOdds.selection}
                  </p>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-accent-green font-bold text-xl">
                      {formatOddsDisplay(bestOdds.odds)}
                    </span>
                    <span className="text-text-muted text-sm">@</span>
                    <span className="text-accent-blue font-semibold text-sm">
                      {bestOdds.bookmaker}
                    </span>
                  </div>
                  
                  {bestOdds.kellyRecommendation && settings.currentBankroll > 0 && (
                    <div className="p-2 bg-dark-card/60 rounded-lg mb-2 border border-dark-border/50">
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted text-xs">
                          {bestOdds.kellyRecommendation.method === 'kelly' ? 'Kelly Sizing' : 'Recommended Bet'}
                        </span>
                        <span className="text-accent-green font-bold">
                          ${bestOdds.kellyRecommendation.betSize.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-text-muted text-xs">
                          {bestOdds.kellyRecommendation.percentage.toFixed(1)}% of bankroll
                        </span>
                        <span className="text-text-secondary text-xs">
                          (${settings.currentBankroll.toFixed(0)} balance)
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-white font-bold text-lg mb-2">
                  {state.aiPrediction.recommendedBet.selection}
                </p>
              )}
              
              <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
                {state.aiPrediction.recommendedBet.reasoning}
              </p>
              
              {bestOdds && (
                <div className="flex items-center gap-1.5 mt-4 text-accent-green text-xs font-medium">
                  <span>Apply Pick</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
              
              {!bestOdds && state.odds.length === 0 && (
                <p className="text-yellow-400/80 text-xs mt-3">
                  Waiting for odds data to find best book...
                </p>
              )}
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg border ${getConfidenceBg(state.aiPrediction.confidence)}`}>
              <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1">Edge Confidence</p>
              <p className={`font-bold text-2xl ${getConfidenceColor(state.aiPrediction.confidence)}`}>
                {state.aiPrediction.confidence}%
              </p>
            </div>
            
            {state.aiPrediction.predictedScore && (
              <div className="p-3 bg-dark-hover rounded-lg">
                <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1">Projected Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-bold text-xl">{state.aiPrediction.predictedScore.away}</span>
                  <span className="text-text-muted text-xs">-</span>
                  <span className="text-white font-bold text-xl">{state.aiPrediction.predictedScore.home}</span>
                </div>
              </div>
            )}
          </div>

          {state.aiPrediction.edgeAnalysis && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-[10px] uppercase tracking-wider font-medium mb-3">Edge Analysis</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-text-muted text-xs">Market Line</p>
                  <p className="text-white font-medium">{state.aiPrediction.edgeAnalysis.marketLine}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">Fair Line</p>
                  <p className="text-accent-green font-medium">{state.aiPrediction.edgeAnalysis.fairLine}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">Public Side</p>
                  <p className="text-red-400 font-medium">{state.aiPrediction.edgeAnalysis.publicSide}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">Sharp Side</p>
                  <p className="text-accent-green font-medium">{state.aiPrediction.edgeAnalysis.sharpSide}</p>
                </div>
              </div>
              {state.aiPrediction.edgeAnalysis.edgePercent > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-xs">Estimated Edge</span>
                    <span className="text-accent-green font-bold">+{state.aiPrediction.edgeAnalysis.edgePercent}%</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-3 bg-dark-hover rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-[10px] uppercase tracking-wider">Predicted Winner</p>
                <p className="text-white font-semibold mt-0.5">{state.aiPrediction.predictedWinner}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-accent-green/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {state.aiPrediction.analysis && (
            <div className="p-3 bg-dark-hover rounded-lg">
              <p className="text-text-muted text-[10px] uppercase tracking-wider mb-2">Analysis</p>
              <p className="text-text-secondary text-sm leading-relaxed">{state.aiPrediction.analysis}</p>
            </div>
          )}

          {state.aiPrediction.keyFactors && state.aiPrediction.keyFactors.length > 0 && (
            <div className="p-3 bg-dark-hover rounded-lg">
              <p className="text-text-muted text-[10px] uppercase tracking-wider mb-2">Key Factors</p>
              <ul className="space-y-2">
                {state.aiPrediction.keyFactors.map((factor: string, i: number) => (
                  <li key={i} className="text-text-secondary text-sm flex items-start gap-2">
                    <span className="text-accent-green mt-1 text-xs">▸</span>
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
