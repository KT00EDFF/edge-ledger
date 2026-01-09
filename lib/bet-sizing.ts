import { BetSizeRecommendation } from '@/types'

/**
 * Calculate recommended bet size based on confidence level and bankroll
 * @param bankroll Current bankroll
 * @param confidence AI confidence level (0-100)
 * @param minBet Minimum bet size
 * @param maxBet Maximum bet size
 * @param useKelly Whether to use Kelly Criterion
 * @param odds American odds (for Kelly calculation)
 * @returns Bet size recommendation
 */
export function calculateBetSize(
  bankroll: number,
  confidence: number,
  minBet: number,
  maxBet: number,
  useKelly: boolean = false,
  odds?: number
): BetSizeRecommendation {
  if (useKelly && odds) {
    // Kelly Criterion: f = (bp - q) / b
    // where b = decimal odds - 1, p = probability, q = 1-p
    const decimalOdds = americanToDecimal(odds)
    const b = decimalOdds - 1
    const p = confidence / 100
    const q = 1 - p

    // Conservative Kelly (using 25% of full Kelly to reduce variance)
    const kellyFraction = ((b * p - q) / b) * 0.25

    // Ensure positive and within bounds
    const fraction = Math.max(0, Math.min(0.1, kellyFraction))
    const betSize = bankroll * fraction

    return {
      betSize: Math.max(minBet, Math.min(maxBet, betSize)),
      percentage: fraction * 100,
      method: 'kelly',
    }
  }

  // Confidence-based sizing
  let percentage: number
  if (confidence >= 90) percentage = 0.07
  else if (confidence >= 80) percentage = 0.05
  else if (confidence >= 70) percentage = 0.03
  else if (confidence >= 60) percentage = 0.015
  else percentage = 0.01

  const betSize = bankroll * percentage

  return {
    betSize: Math.max(minBet, Math.min(maxBet, betSize)),
    percentage: percentage * 100,
    method: 'confidence',
  }
}

/**
 * Convert American odds to decimal odds
 */
export function americanToDecimal(americanOdds: number): number {
  if (americanOdds > 0) {
    return americanOdds / 100 + 1
  } else {
    return 100 / Math.abs(americanOdds) + 1
  }
}

/**
 * Convert American odds to fractional odds
 */
export function americanToFractional(americanOdds: number): string {
  if (americanOdds > 0) {
    return `${americanOdds}/100`
  } else {
    return `100/${Math.abs(americanOdds)}`
  }
}

/**
 * Calculate potential payout from bet size and odds
 */
export function calculatePayout(betSize: number, americanOdds: number): number {
  const decimalOdds = americanToDecimal(americanOdds)
  return betSize * decimalOdds
}

/**
 * Calculate profit from bet result
 */
export function calculateProfit(
  betSize: number,
  americanOdds: number,
  result: 'Won' | 'Lost' | 'Push'
): number {
  if (result === 'Push') return 0
  if (result === 'Lost') return -betSize

  const payout = calculatePayout(betSize, americanOdds)
  return payout - betSize
}
