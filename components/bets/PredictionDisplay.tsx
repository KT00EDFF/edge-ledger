'use client'

import { PredictionResult, MatchupInput } from '@/types'

interface Props {
  prediction: PredictionResult
  matchup: MatchupInput
  onContinue: () => void
  onBack: () => void
}

export default function PredictionDisplay({ prediction, matchup, onContinue, onBack }: Props) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-accent-green'
    if (confidence >= 70) return 'text-accent-yellow'
    return 'text-accent-red'
  }

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 80) return 'bg-accent-green/20 border-accent-green/30'
    if (confidence >= 70) return 'bg-accent-yellow/20 border-accent-yellow/30'
    return 'bg-accent-red/20 border-accent-red/30'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">AI Prediction</h2>
          <p className="text-text-secondary">
            {matchup.awayTeam} @ {matchup.homeTeam}
          </p>
        </div>
        <div className="text-right">
          <p className="text-text-muted text-sm">
            {new Date(matchup.gameDate).toLocaleDateString()}
          </p>
          <p className="text-text-muted text-sm">
            {new Date(matchup.gameDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className={`rounded-xl p-6 border ${getConfidenceBg(prediction.confidence)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-muted text-sm mb-1">Prediction</p>
            <p className="text-2xl font-bold text-white">{prediction.prediction}</p>
          </div>
          <div className="text-right">
            <p className="text-text-muted text-sm mb-1">Confidence</p>
            <p className={`text-4xl font-bold ${getConfidenceColor(prediction.confidence)}`}>
              {prediction.confidence}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-dark-hover rounded-xl p-5 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
          <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>Reasoning</span>
        </h3>
        <p className="text-text-secondary leading-relaxed">{prediction.reasoning}</p>
      </div>

      {prediction.keyFactors && prediction.keyFactors.length > 0 && (
        <div className="bg-dark-hover rounded-xl p-5 border border-dark-border">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <svg className="w-5 h-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Key Factors</span>
          </h3>
          <ul className="space-y-2">
            {prediction.keyFactors.map((factor, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="text-accent-green mt-1">•</span>
                <span className="text-text-secondary">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {prediction.concerns && (
        <div className="bg-accent-red/10 rounded-xl p-5 border border-accent-red/30">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <svg className="w-5 h-5 text-accent-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Concerns</span>
          </h3>
          <p className="text-text-secondary">{prediction.concerns}</p>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button onClick={onBack} className="flex-1 btn-secondary">
          Back
        </button>
        <button onClick={onContinue} className="flex-1 btn-primary">
          Continue to Odds
        </button>
      </div>
    </div>
  )
}
