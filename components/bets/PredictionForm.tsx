'use client'

import { useState } from 'react'
import { MatchupInput } from '@/types'

interface Props {
  onSubmit: (data: MatchupInput) => void
  isLoading: boolean
}

const SPORTS = [
  'NFL',
  'NBA',
  'MLB',
  'NHL',
  'Soccer',
  'College Football',
  'College Basketball',
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
        <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
          Sport
        </label>
        <select
          id="sport"
          name="sport"
          value={formData.sport}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        >
          {SPORTS.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="homeTeam" className="block text-sm font-medium text-gray-700 mb-2">
          Home Team
        </label>
        <input
          type="text"
          id="homeTeam"
          name="homeTeam"
          value={formData.homeTeam}
          onChange={handleChange}
          placeholder="e.g., Kansas City Chiefs"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="awayTeam" className="block text-sm font-medium text-gray-700 mb-2">
          Away Team
        </label>
        <input
          type="text"
          id="awayTeam"
          name="awayTeam"
          value={formData.awayTeam}
          onChange={handleChange}
          placeholder="e.g., San Francisco 49ers"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="gameDate" className="block text-sm font-medium text-gray-700 mb-2">
          Game Date
        </label>
        <input
          type="datetime-local"
          id="gameDate"
          name="gameDate"
          value={formData.gameDate}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Generating Prediction...' : 'Get AI Prediction'}
      </button>
    </form>
  )
}
