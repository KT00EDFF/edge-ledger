import { PredictionResult, OddsData, MatchupInput } from '@/types'

/**
 * Mock data for development and when API keys are not configured
 */

export function generateMockPrediction(matchup: MatchupInput): PredictionResult {
  // Randomize confidence for more realistic mock data
  const confidence = Math.floor(Math.random() * 30) + 65 // 65-95%

  const predictions = ['Home Win', 'Away Win', 'Draw']
  const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)]

  return {
    prediction: randomPrediction,
    confidence,
    reasoning: `🤖 MOCK PREDICTION: This is simulated AI analysis. Configure OPENAI_API_KEY in .env.local for real predictions.\n\nBased on recent performance trends and historical matchup data between ${matchup.homeTeam} and ${matchup.awayTeam}, the model suggests ${randomPrediction.toLowerCase()}. The home team has shown strong form in recent games, while the away team faces challenges with their current roster configuration.`,
    keyFactors: [
      `${matchup.homeTeam} has won 3 of their last 5 home games`,
      `${matchup.awayTeam} struggling with injuries to key players`,
      'Weather conditions favor the home team\'s playing style',
      'Historical head-to-head record leans toward home advantage',
    ],
    concerns: 'Mock data - actual game factors not analyzed. Real AI predictions require OpenAI API key configuration.',
  }
}

export function generateMockOdds(
  homeTeam: string,
  awayTeam: string
): OddsData[] {
  const mockOdds: OddsData[] = []

  const sportsbooks = [
    { name: 'DraftKings', key: 'draftkings' },
    { name: 'FanDuel', key: 'fanduel' },
    { name: 'BetMGM', key: 'betmgm' },
  ]

  sportsbooks.forEach((book) => {
    // Moneyline odds (randomized)
    const homeOdds = -Math.floor(Math.random() * 200) - 100 // -100 to -300
    const awayOdds = Math.floor(Math.random() * 200) + 100 // +100 to +300

    mockOdds.push({
      sportsbook: book.name,
      sportsbookId: book.key,
      betType: 'Moneyline',
      odds: homeOdds,
      oddsDecimal: americanToDecimal(homeOdds),
    })

    mockOdds.push({
      sportsbook: book.name,
      sportsbookId: book.key,
      betType: 'Moneyline',
      odds: awayOdds,
      oddsDecimal: americanToDecimal(awayOdds),
    })

    // Spread odds
    const spread = (Math.random() * 10 - 5).toFixed(1) // -5 to +5
    mockOdds.push({
      sportsbook: book.name,
      sportsbookId: book.key,
      betType: 'Spread',
      odds: -110,
      oddsDecimal: 1.91,
      line: parseFloat(spread),
    })

    // Total (Over/Under)
    const total = (Math.random() * 20 + 40).toFixed(1) // 40-60
    mockOdds.push(
      {
        sportsbook: book.name,
        sportsbookId: book.key,
        betType: 'Total',
        odds: -110,
        oddsDecimal: 1.91,
        line: parseFloat(total),
      },
      {
        sportsbook: book.name,
        sportsbookId: book.key,
        betType: 'Total',
        odds: -110,
        oddsDecimal: 1.91,
        line: -parseFloat(total),
      }
    )
  })

  return mockOdds
}

function americanToDecimal(americanOdds: number): number {
  if (americanOdds > 0) {
    return americanOdds / 100 + 1
  } else {
    return 100 / Math.abs(americanOdds) + 1
  }
}

export function isMockMode(): {
  predictions: boolean
  odds: boolean
} {
  return {
    predictions: !process.env.OPENAI_API_KEY,
    odds: !process.env.ODDS_API_KEY,
  }
}
