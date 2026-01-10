'use client'

import { useState } from 'react'
import { MatchupInput } from '@/types'

interface Props {
  onSubmit: (data: MatchupInput) => void
  isLoading: boolean
}

const SPORTS = [
  { id: 'NFL', name: 'NFL', icon: '🏈' },
  { id: 'NBA', name: 'NBA', icon: '🏀' },
  { id: 'MLB', name: 'MLB', icon: '⚾' },
  { id: 'NHL', name: 'NHL', icon: '🏒' },
  { id: 'Soccer', name: 'Soccer', icon: '⚽' },
  { id: 'College Football', name: 'College Football', icon: '🏈' },
  { id: 'College Basketball', name: 'College Basketball', icon: '🏀' },
]

export default function PredictionForm({ onSubmit, isLoading }: Props) {
  const [formData, setFormData] = useState<MatchupInput>({
    sport: 'NFL',
    homeTeam: '',
    awayTeam: '',
    gameDate: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="sport" className="label-dark">
          Sport
        </label>
        <select
          id="sport"
          name="sport"
          value={formData.sport}
          onChange={handleChange}
          className="input-dark"
          required
        >
          {SPORTS.map((sport) => (
            <option key={sport.id} value={sport.id}>
              {sport.icon} {sport.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="awayTeam" className="label-dark">
            Away Team
          </label>
          <input
            type="text"
            id="awayTeam"
            name="awayTeam"
            value={formData.awayTeam}
            onChange={handleChange}
            placeholder="e.g., San Francisco 49ers"
            className="input-dark"
            required
          />
        </div>

        <div>
          <label htmlFor="homeTeam" className="label-dark">
            Home Team
          </label>
          <input
            type="text"
            id="homeTeam"
            name="homeTeam"
            value={formData.homeTeam}
            onChange={handleChange}
            placeholder="e.g., Kansas City Chiefs"
            className="input-dark"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-center py-2">
        <span className="text-text-muted text-sm">@</span>
      </div>

      <div>
        <label htmlFor="gameDate" className="label-dark">
          Game Date & Time
        </label>
        <input
          type="datetime-local"
          id="gameDate"
          name="gameDate"
          value={formData.gameDate}
          onChange={handleChange}
          className="input-dark"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating Prediction...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Get AI Prediction</span>
          </span>
        )}
      </button>
    </form>
  )
}
