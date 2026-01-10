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

  const steps = [
    { id: 'input', label: 'Matchup', number: 1 },
    { id: 'prediction', label: 'Prediction', number: 2 },
    { id: 'odds', label: 'Odds', number: 3 },
    { id: 'confirm', label: 'Confirm', number: 4 },
  ]

  const getStepStatus = (stepId: string) => {
    const stepOrder = ['input', 'prediction', 'odds', 'confirm']
    const currentIndex = stepOrder.indexOf(currentStep)
    const stepIndex = stepOrder.indexOf(stepId)
    
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="page-title">Create New Bet</h1>
        <p className="page-subtitle">Get AI predictions and find the best odds</p>
      </div>

      <div className="mb-8 overflow-x-auto">
        <div className="flex items-center min-w-[400px]">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id)
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                      status === 'completed'
                        ? 'bg-accent-green text-dark-bg'
                        : status === 'active'
                        ? 'bg-accent-blue text-white'
                        : 'bg-dark-hover text-text-secondary border border-dark-border'
                    }`}
                  >
                    {status === 'completed' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <p className={`mt-2 text-xs md:text-sm font-medium ${
                    status === 'active' ? 'text-white' : 'text-text-secondary'
                  }`}>
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-2 md:mx-4">
                    <div className={`h-0.5 rounded ${
                      getStepStatus(steps[index + 1].id) !== 'pending' 
                        ? 'bg-accent-green' 
                        : 'bg-dark-border'
                    }`} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-accent-red/10 border border-accent-red/30 rounded-lg flex items-center space-x-3">
          <svg className="w-5 h-5 text-accent-red flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-accent-red">{error}</p>
        </div>
      )}

      <div className="card">
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
