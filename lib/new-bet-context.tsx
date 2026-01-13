'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { NormalizedMatchup } from './sports-mapper'

export interface OddsData {
  bookmaker: string
  spreads?: {
    home: { point: number; price: number }
    away: { point: number; price: number }
  }
  moneyline?: {
    home: number
    away: number
  }
  totals?: {
    over: { point: number; price: number }
    under: { point: number; price: number }
  }
}

export interface BetSelection {
  bookmaker: string
  betType: 'spread' | 'moneyline' | 'total'
  selection: string
  odds: number
  line?: number
}

interface NewBetState {
  selectedSport: string
  matchups: NormalizedMatchup[]
  matchupsLoading: boolean
  matchupsError: string | null
  selectedMatchup: NormalizedMatchup | null
  odds: OddsData[]
  oddsLoading: boolean
  oddsError: string | null
  aiEnabled: boolean
  aiPrediction: any | null
  aiLoading: boolean
  aiError: string | null
  betSelection: BetSelection | null
  showConfirmModal: boolean
}

type NewBetAction =
  | { type: 'SET_SPORT'; sport: string }
  | { type: 'SET_MATCHUPS'; matchups: NormalizedMatchup[] }
  | { type: 'SET_MATCHUPS_LOADING'; loading: boolean }
  | { type: 'SET_MATCHUPS_ERROR'; error: string | null }
  | { type: 'SELECT_MATCHUP'; matchup: NormalizedMatchup | null }
  | { type: 'SET_ODDS'; odds: OddsData[] }
  | { type: 'SET_ODDS_LOADING'; loading: boolean }
  | { type: 'SET_ODDS_ERROR'; error: string | null }
  | { type: 'TOGGLE_AI'; enabled: boolean }
  | { type: 'SET_AI_PREDICTION'; prediction: any }
  | { type: 'SET_AI_LOADING'; loading: boolean }
  | { type: 'SET_AI_ERROR'; error: string | null }
  | { type: 'SET_BET_SELECTION'; selection: BetSelection | null }
  | { type: 'SHOW_CONFIRM_MODAL'; show: boolean }
  | { type: 'RESET' }

const initialState: NewBetState = {
  selectedSport: 'nfl',
  matchups: [],
  matchupsLoading: false,
  matchupsError: null,
  selectedMatchup: null,
  odds: [],
  oddsLoading: false,
  oddsError: null,
  aiEnabled: false,
  aiPrediction: null,
  aiLoading: false,
  aiError: null,
  betSelection: null,
  showConfirmModal: false
}

function newBetReducer(state: NewBetState, action: NewBetAction): NewBetState {
  switch (action.type) {
    case 'SET_SPORT':
      return {
        ...state,
        selectedSport: action.sport,
        matchups: [],
        selectedMatchup: null,
        odds: [],
        aiPrediction: null,
        betSelection: null
      }
    case 'SET_MATCHUPS':
      return { ...state, matchups: action.matchups, matchupsError: null }
    case 'SET_MATCHUPS_LOADING':
      return { ...state, matchupsLoading: action.loading }
    case 'SET_MATCHUPS_ERROR':
      return { ...state, matchupsError: action.error }
    case 'SELECT_MATCHUP':
      return {
        ...state,
        selectedMatchup: action.matchup,
        odds: [],
        aiPrediction: null,
        betSelection: null
      }
    case 'SET_ODDS':
      return { ...state, odds: action.odds, oddsError: null }
    case 'SET_ODDS_LOADING':
      return { ...state, oddsLoading: action.loading }
    case 'SET_ODDS_ERROR':
      return { ...state, oddsError: action.error }
    case 'TOGGLE_AI':
      return { ...state, aiEnabled: action.enabled, aiPrediction: null, aiError: null }
    case 'SET_AI_PREDICTION':
      return { ...state, aiPrediction: action.prediction }
    case 'SET_AI_LOADING':
      return { ...state, aiLoading: action.loading }
    case 'SET_AI_ERROR':
      return { ...state, aiError: action.error }
    case 'SET_BET_SELECTION':
      return { ...state, betSelection: action.selection }
    case 'SHOW_CONFIRM_MODAL':
      return { ...state, showConfirmModal: action.show }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

interface NewBetContextValue {
  state: NewBetState
  dispatch: React.Dispatch<NewBetAction>
  selectSport: (sport: string) => void
  selectMatchup: (matchup: NormalizedMatchup) => void
  toggleAI: (enabled: boolean) => void
  selectBet: (selection: BetSelection) => void
  openConfirmModal: () => void
  closeConfirmModal: () => void
  reset: () => void
}

const NewBetContext = createContext<NewBetContextValue | null>(null)

export function NewBetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(newBetReducer, initialState)

  const selectSport = (sport: string) => {
    dispatch({ type: 'SET_SPORT', sport })
  }

  const selectMatchup = (matchup: NormalizedMatchup) => {
    dispatch({ type: 'SELECT_MATCHUP', matchup })
  }

  const toggleAI = (enabled: boolean) => {
    dispatch({ type: 'TOGGLE_AI', enabled })
  }

  const selectBet = (selection: BetSelection) => {
    dispatch({ type: 'SET_BET_SELECTION', selection })
    dispatch({ type: 'SHOW_CONFIRM_MODAL', show: true })
  }

  const openConfirmModal = () => {
    dispatch({ type: 'SHOW_CONFIRM_MODAL', show: true })
  }

  const closeConfirmModal = () => {
    dispatch({ type: 'SHOW_CONFIRM_MODAL', show: false })
  }

  const reset = () => {
    dispatch({ type: 'RESET' })
  }

  return (
    <NewBetContext.Provider
      value={{
        state,
        dispatch,
        selectSport,
        selectMatchup,
        toggleAI,
        selectBet,
        openConfirmModal,
        closeConfirmModal,
        reset
      }}
    >
      {children}
    </NewBetContext.Provider>
  )
}

export function useNewBet() {
  const context = useContext(NewBetContext)
  if (!context) {
    throw new Error('useNewBet must be used within a NewBetProvider')
  }
  return context
}
