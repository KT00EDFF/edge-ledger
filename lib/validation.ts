import { z } from 'zod'

/**
 * Validation schemas for user inputs
 * Provides type-safe validation and sanitization
 */

export const matchupSchema = z.object({
  sport: z.string().min(1, 'Sport is required'),
  homeTeam: z.string().min(1, 'Home team is required').max(100),
  awayTeam: z.string().min(1, 'Away team is required').max(100),
  gameDate: z.string().datetime('Invalid date format'),
})

export const predictionSchema = z.object({
  prediction: z.string().min(1),
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  keyFactors: z.array(z.string()).optional(),
  concerns: z.string().optional(),
})

export const betCreationSchema = z.object({
  userId: z.string().min(1),
  sportsbookId: z.string().min(1),
  sport: z.string().min(1),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  gameDate: z.string(),
  prediction: z.string().min(1),
  confidence: z.number().min(0).max(100),
  aiReasoning: z.string().min(1),
  betType: z.enum(['Moneyline', 'Spread', 'Total']),
  odds: z.number(),
  oddsDecimal: z.number().optional(),
  line: z.number().optional(),
  betSize: z.number().positive('Bet size must be positive'),
  potentialPayout: z.number().positive('Potential payout must be positive'),
})

export const settlementSchema = z.object({
  result: z.enum(['Won', 'Lost', 'Push']),
})

export const oddsRequestSchema = z.object({
  sport: z.string().min(1),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  userSportsbooks: z.array(z.string()),
})

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets to prevent HTML injection
    .slice(0, 1000) // Limit length
}

/**
 * Validate and sanitize matchup input
 */
export function validateMatchup(data: unknown) {
  const result = matchupSchema.safeParse(data)
  if (!result.success) {
    throw new Error(`Invalid matchup data: ${result.error.message}`)
  }
  return result.data
}

/**
 * Validate bet creation data
 */
export function validateBetCreation(data: unknown) {
  const result = betCreationSchema.safeParse(data)
  if (!result.success) {
    throw new Error(`Invalid bet data: ${result.error.message}`)
  }
  return result.data
}

/**
 * Validate settlement data
 */
export function validateSettlement(data: unknown) {
  const result = settlementSchema.safeParse(data)
  if (!result.success) {
    throw new Error(`Invalid settlement data: ${result.error.message}`)
  }
  return result.data
}
