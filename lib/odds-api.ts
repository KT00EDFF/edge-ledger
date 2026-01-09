import axios from 'axios'
import { OddsData } from '@/types'
import { generateMockOdds } from './mock-data'

const ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4'
const API_KEY = process.env.ODDS_API_KEY

interface OddsApiResponse {
  id: string
  sport_key: string
  sport_title: string
  commence_time: string
  home_team: string
  away_team: string
  bookmakers: Array<{
    key: string
    title: string
    markets: Array<{
      key: string
      outcomes: Array<{
        name: string
        price: number
        point?: number
      }>
    }>
  }>
}

/**
 * Fetch odds for a specific matchup
 * Falls back to mock data if ODDS_API_KEY is not configured
 * @param sport Sport key (e.g., 'americanfootball_nfl', 'basketball_nba')
 * @param homeTeam Home team name
 * @param awayTeam Away team name
 * @param userSportsbooks List of sportsbooks user has accounts with
 * @returns Array of odds from user's sportsbooks
 */
export async function fetchOdds(
  sport: string,
  homeTeam: string,
  awayTeam: string,
  userSportsbooks: string[]
): Promise<OddsData[]> {
  // Use mock data if Odds API key is not configured
  if (!API_KEY) {
    console.log('📊 Using mock odds data (ODDS_API_KEY not configured)')
    // Simulate API delay for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 800))
    return generateMockOdds(homeTeam, awayTeam)
  }

  try {
    const sportKey = getSportKey(sport)
    const response = await axios.get<OddsApiResponse[]>(
      `${ODDS_API_BASE_URL}/sports/${sportKey}/odds`,
      {
        params: {
          apiKey: API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
        },
      }
    )

    // Find the matching game
    const game = response.data.find(
      (g) =>
        g.home_team.toLowerCase().includes(homeTeam.toLowerCase()) ||
        homeTeam.toLowerCase().includes(g.home_team.toLowerCase())
    )

    if (!game) {
      throw new Error('Game not found')
    }

    // Extract odds from user's sportsbooks
    const oddsData: OddsData[] = []

    game.bookmakers.forEach((bookmaker) => {
      if (userSportsbooks.includes(bookmaker.key)) {
        // Process moneyline (h2h)
        const h2hMarket = bookmaker.markets.find((m) => m.key === 'h2h')
        if (h2hMarket) {
          h2hMarket.outcomes.forEach((outcome) => {
            oddsData.push({
              sportsbook: bookmaker.title,
              sportsbookId: bookmaker.key,
              betType: 'Moneyline',
              odds: outcome.price,
              oddsDecimal: americanToDecimal(outcome.price),
            })
          })
        }

        // Process spreads
        const spreadMarket = bookmaker.markets.find((m) => m.key === 'spreads')
        if (spreadMarket) {
          spreadMarket.outcomes.forEach((outcome) => {
            oddsData.push({
              sportsbook: bookmaker.title,
              sportsbookId: bookmaker.key,
              betType: 'Spread',
              odds: outcome.price,
              oddsDecimal: americanToDecimal(outcome.price),
              line: outcome.point,
            })
          })
        }

        // Process totals
        const totalsMarket = bookmaker.markets.find((m) => m.key === 'totals')
        if (totalsMarket) {
          totalsMarket.outcomes.forEach((outcome) => {
            oddsData.push({
              sportsbook: bookmaker.title,
              sportsbookId: bookmaker.key,
              betType: 'Total',
              odds: outcome.price,
              oddsDecimal: americanToDecimal(outcome.price),
              line: outcome.point,
            })
          })
        }
      }
    })

    return oddsData
  } catch (error) {
    console.error('Error fetching odds:', error)
    // Fall back to mock data on error
    console.log('⚠️  Odds API error, falling back to mock data')
    return generateMockOdds(homeTeam, awayTeam)
  }
}

/**
 * Get the best odds for a specific bet type and team
 */
export function getBestOdds(
  oddsData: OddsData[],
  betType: string,
  team?: string
): OddsData | null {
  const filtered = oddsData.filter((od) => od.betType === betType)

  if (filtered.length === 0) return null

  // Find the best odds (highest value for positive odds, closest to 0 for negative)
  return filtered.reduce((best, current) => {
    if (current.odds > best.odds) return current
    return best
  })
}

/**
 * Convert sport name to Odds API sport key
 */
function getSportKey(sport: string): string {
  const sportMap: Record<string, string> = {
    NFL: 'americanfootball_nfl',
    NBA: 'basketball_nba',
    MLB: 'baseball_mlb',
    NHL: 'icehockey_nhl',
    Soccer: 'soccer_epl',
    'Premier League': 'soccer_epl',
    'College Football': 'americanfootball_ncaaf',
    'College Basketball': 'basketball_ncaab',
  }

  return sportMap[sport] || sport.toLowerCase().replace(/\s+/g, '_')
}

/**
 * Convert American odds to decimal odds
 */
function americanToDecimal(americanOdds: number): number {
  if (americanOdds > 0) {
    return americanOdds / 100 + 1
  } else {
    return 100 / Math.abs(americanOdds) + 1
  }
}

/**
 * Get available sports from The Odds API
 */
export async function getAvailableSports() {
  try {
    const response = await axios.get(`${ODDS_API_BASE_URL}/sports`, {
      params: {
        apiKey: API_KEY,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error fetching sports:', error)
    throw new Error('Failed to fetch available sports')
  }
}
