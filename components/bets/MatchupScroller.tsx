'use client'

import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { useNewBet } from '@/lib/new-bet-context'
import { NormalizedMatchup } from '@/lib/sports-mapper'

export default function MatchupScroller() {
  const { state, dispatch, selectMatchup } = useNewBet()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchMatchups = async () => {
      dispatch({ type: 'SET_MATCHUPS_LOADING', loading: true })
      try {
        const response = await fetch(`/api/espn/${state.selectedSport}`)
        if (!response.ok) throw new Error('Failed to fetch matchups')
        const data = await response.json()
        dispatch({ type: 'SET_MATCHUPS', matchups: data.matchups || [] })
      } catch (error) {
        dispatch({ type: 'SET_MATCHUPS_ERROR', error: 'Failed to load games' })
      } finally {
        dispatch({ type: 'SET_MATCHUPS_LOADING', loading: false })
      }
    }

    fetchMatchups()
  }, [state.selectedSport, dispatch])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const formatGameTime = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'h:mm a')
  }

  const formatGameDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    }
    return format(date, 'MMM d')
  }

  if (state.matchupsLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 w-48 h-28 bg-dark-card border border-dark-border rounded-xl animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (state.matchupsError) {
    return (
      <div className="card text-center py-6">
        <p className="text-accent-red">{state.matchupsError}</p>
        <button
          onClick={() => dispatch({ type: 'SET_SPORT', sport: state.selectedSport })}
          className="btn-secondary mt-3"
        >
          Retry
        </button>
      </div>
    )
  }

  if (state.matchups.length === 0) {
    return (
      <div className="card text-center py-8">
        <svg className="w-12 h-12 mx-auto mb-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-text-secondary">No games scheduled for today</p>
        <p className="text-text-muted text-sm mt-1">Check back later or try another sport</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-dark-bg/90 border border-dark-border rounded-full flex items-center justify-center text-white hover:bg-dark-hover transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-6 py-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {state.matchups.map((matchup: NormalizedMatchup) => (
          <button
            key={matchup.id}
            onClick={() => selectMatchup(matchup)}
            className={`flex-shrink-0 w-52 p-4 rounded-xl border transition-all ${
              state.selectedMatchup?.id === matchup.id
                ? 'bg-accent-blue/10 border-accent-blue'
                : 'bg-dark-card border-dark-border hover:border-accent-blue/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-muted">{formatGameDate(matchup.startTime)}</span>
              <span className="text-xs font-medium px-2 py-0.5 bg-dark-hover rounded text-text-secondary">
                {matchup.sportName}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {matchup.awayTeam.logo ? (
                  <img
                    src={matchup.awayTeam.logo}
                    alt={matchup.awayTeam.shortName}
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <div className="w-6 h-6 bg-dark-hover rounded-full" />
                )}
                <span className="text-sm font-medium text-white truncate flex-1">
                  {matchup.awayTeam.shortName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {matchup.homeTeam.logo ? (
                  <img
                    src={matchup.homeTeam.logo}
                    alt={matchup.homeTeam.shortName}
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <div className="w-6 h-6 bg-dark-hover rounded-full" />
                )}
                <span className="text-sm font-medium text-white truncate flex-1">
                  {matchup.homeTeam.shortName}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-dark-border">
              <span className="text-xs text-accent-blue font-medium">
                {formatGameTime(matchup.startTime)}
              </span>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-dark-bg/90 border border-dark-border rounded-full flex items-center justify-center text-white hover:bg-dark-hover transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
