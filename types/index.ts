export interface RecommendedBet {
  betType: 'moneyline' | 'spread' | 'total'
  selection: string
  line?: number
  reasoning: string
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
  recommendedBet?: RecommendedBet
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
