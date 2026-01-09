'use client'

import { PredictionResult, MatchupInput } from '@/types'

interface Props {
  prediction: PredictionResult
  matchup: MatchupInput
  onContinue: () => void
  onBack: () => void
}

export default function PredictionDisplay({ prediction, matchup, onContinue, onBack }: Props) {
  const confidenceColor =
    prediction.confidence >= 80
      ? 'text-green-600'
      : prediction.confidence >= 70
      ? 'text-yellow-600'
      : 'text-orange-600'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Prediction</h2>
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <p className="text-sm text-gray-600 mb-2">
            {matchup.awayTeam} @ {matchup.homeTeam}
          </p>
          <p className="text-sm text-gray-500">{new Date(matchup.gameDate).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Prediction</p>
            <p className="text-2xl font-bold text-gray-900">{prediction.prediction}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600 mb-1">Confidence</p>
            <p className={`text-3xl font-bold ${confidenceColor}`}>{prediction.confidence}%</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Reasoning</h3>
        <p className="text-gray-700 leading-relaxed">{prediction.reasoning}</p>
      </div>

      {prediction.keyFactors && prediction.keyFactors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Factors</h3>
          <ul className="space-y-2">
            {prediction.keyFactors.map((factor, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span className="text-gray-700">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {prediction.concerns && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Concerns & Uncertainties</h3>
          <p className="text-gray-700">{prediction.concerns}</p>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue to Odds
        </button>
      </div>
    </div>
  )
}
