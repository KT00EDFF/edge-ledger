'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PredictionForm from '@/components/bets/PredictionForm'
import PredictionDisplay from '@/components/bets/PredictionDisplay'
import OddsDisplay from '@/components/bets/OddsDisplay'
import BetConfirmation from '@/components/bets/BetConfirmation'
import { PredictionResult, OddsData, MatchupInput } from '@/types'

type Step = 'input' | 'prediction' | 'odds' | 'confirm'

export default function NewBetPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('input')
  const [matchup, setMatchup] = useState<MatchupInput | null>(null)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [selectedOdds, setSelectedOdds] = useState<OddsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMatchupSubmit = async (data: MatchupInput) => {
    setIsLoading(true)
    setError(null)
    setMatchup(data)

    try {
      // Generate AI prediction
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to generate prediction')
      }

      const predictionData: PredictionResult = await response.json()
      setPrediction(predictionData)
      setCurrentStep('prediction')
    } catch (err) {
      setError('Failed to generate prediction. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePredictionContinue = () => {
    setCurrentStep('odds')
  }

  const handleOddsSelect = (odds: OddsData) => {
    setSelectedOdds(odds)
    setCurrentStep('confirm')
  }

  const handleBetConfirm = async (betDetails: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betDetails),
      })

      if (!response.ok) {
        throw new Error('Failed to create bet')
      }

      // Redirect to dashboard on success
      router.push('/')
    } catch (err) {
      setError('Failed to create bet. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep === 'prediction') setCurrentStep('input')
    else if (currentStep === 'odds') setCurrentStep('prediction')
    else if (currentStep === 'confirm') setCurrentStep('odds')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Bet</h1>
        <p className="text-gray-600">Get AI predictions and find the best odds</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <Step number={1} label="Matchup" active={currentStep === 'input'} completed={['prediction', 'odds', 'confirm'].includes(currentStep)} />
          <div className="flex-1 h-1 bg-gray-200 mx-2">
            <div className={`h-full ${['prediction', 'odds', 'confirm'].includes(currentStep) ? 'bg-blue-600' : 'bg-gray-200'}`} />
          </div>
          <Step number={2} label="Prediction" active={currentStep === 'prediction'} completed={['odds', 'confirm'].includes(currentStep)} />
          <div className="flex-1 h-1 bg-gray-200 mx-2">
            <div className={`h-full ${['odds', 'confirm'].includes(currentStep) ? 'bg-blue-600' : 'bg-gray-200'}`} />
          </div>
          <Step number={3} label="Odds" active={currentStep === 'odds'} completed={currentStep === 'confirm'} />
          <div className="flex-1 h-1 bg-gray-200 mx-2">
            <div className={`h-full ${currentStep === 'confirm' ? 'bg-blue-600' : 'bg-gray-200'}`} />
          </div>
          <Step number={4} label="Confirm" active={currentStep === 'confirm'} completed={false} />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {currentStep === 'input' && (
          <PredictionForm onSubmit={handleMatchupSubmit} isLoading={isLoading} />
        )}

        {currentStep === 'prediction' && prediction && matchup && (
          <PredictionDisplay
            prediction={prediction}
            matchup={matchup}
            onContinue={handlePredictionContinue}
            onBack={handleBack}
          />
        )}

        {currentStep === 'odds' && matchup && (
          <OddsDisplay
            matchup={matchup}
            onSelect={handleOddsSelect}
            onBack={handleBack}
          />
        )}

        {currentStep === 'confirm' && matchup && prediction && selectedOdds && (
          <BetConfirmation
            matchup={matchup}
            prediction={prediction}
            selectedOdds={selectedOdds}
            onConfirm={handleBetConfirm}
            onBack={handleBack}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}

function Step({
  number,
  label,
  active,
  completed,
}: {
  number: number
  label: string
  active: boolean
  completed: boolean
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
          completed
            ? 'bg-blue-600 text-white'
            : active
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        {completed ? '✓' : number}
      </div>
      <p className={`mt-2 text-sm ${active ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
        {label}
      </p>
    </div>
  )
}
