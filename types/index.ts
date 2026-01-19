export interface RecommendedBet {
  betType: 'moneyline' | 'spread' | 'total'
  selection: string
  line?: number
  reasoning: string
}

export interface EdgeAnalysis {
  marketLine: string
  fairLine: string
  edgePercent: number
  publicSide: string
  sharpSide: string
  // New Phase 2 "Sharp" intangibles
  reverseLineMovement?: string
  motivationalSpot?: string
  weatherImpact?: string
}

export interface PredictionResult {
  predictedWinner: string
  confidence: number
  predictedScore?: {
    home: number
    away: number
  }
  analysis: string
  keyFactors: string[]
  edgeAnalysis?: EdgeAnalysis
  recommendedBet?: RecommendedBet
  // New Gemini 3 Thinking Mode fields
  shouldPass?: boolean  // True when no clear betting edge exists
  modelProjection?: {   // Phase 1: Analytical baseline
    projectedScore: { home: number; away: number }
    methodology: string
  }
  sharpAngle?: string   // Phase 2: The key "sharp" insight
  confidenceRating?: number  // 1-10 scale (UI converts to %)
}

export interface OddsData {
  sportsbook: string
  sportsbookId: string
  betType: string
  odds: number
  oddsDecimal: number
  line?: number
}

export interface BetSizeRecommendation {
  betSize: number
  percentage: number
  method: 'confidence' | 'kelly'
}

export interface MatchupInput {
  sport: string
  homeTeam: string
  awayTeam: string
  gameDate: string
}

export interface DashboardMetrics {
  currentBankroll: number
  totalPL: number
  plPercentage: number
  winRate: number
  recentWinRate5: number
  recentWinRate10: number
  recentWinRate25: number
  roi: number
}

export interface BankrollDataPoint {
  timestamp: Date
  bankroll: number
}

export interface WinRateBySport {
  sport: string
  totalBets: number
  wins: number
  losses: number
  pushes: number
  winRate: number
}

export interface PerformanceByConfidence {
  confidenceRange: string
  totalBets: number
  wins: number
  winRate: number
}
