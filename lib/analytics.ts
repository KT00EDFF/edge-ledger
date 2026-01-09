import { prisma } from './prisma'
import {
  DashboardMetrics,
  WinRateBySport,
  PerformanceByConfidence,
  BankrollDataPoint,
} from '@/types'

/**
 * Calculate dashboard metrics for a user
 */
export async function calculateDashboardMetrics(
  userId: string
): Promise<DashboardMetrics> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bets: {
        where: {
          status: { in: ['Won', 'Lost', 'Push'] },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const settledBets = user.bets
  const totalBets = settledBets.length

  if (totalBets === 0) {
    return {
      currentBankroll: user.currentBankroll,
      totalPL: 0,
      plPercentage: 0,
      winRate: 0,
      recentWinRate5: 0,
      recentWinRate10: 0,
      recentWinRate25: 0,
      roi: 0,
    }
  }

  // Calculate total P&L
  const totalPL = settledBets.reduce((sum, bet) => sum + (bet.profit || 0), 0)
  const plPercentage =
    ((user.currentBankroll - user.startingBankroll) / user.startingBankroll) *
    100

  // Calculate overall win rate
  const wins = settledBets.filter((b) => b.status === 'Won').length
  const winRate = (wins / totalBets) * 100

  // Calculate recent win rates
  const recent5 = settledBets.slice(0, 5)
  const recent10 = settledBets.slice(0, 10)
  const recent25 = settledBets.slice(0, 25)

  const recentWinRate5 =
    recent5.length > 0
      ? (recent5.filter((b) => b.status === 'Won').length / recent5.length) *
        100
      : 0
  const recentWinRate10 =
    recent10.length > 0
      ? (recent10.filter((b) => b.status === 'Won').length / recent10.length) *
        100
      : 0
  const recentWinRate25 =
    recent25.length > 0
      ? (recent25.filter((b) => b.status === 'Won').length / recent25.length) *
        100
      : 0

  // Calculate ROI
  const totalWagered = settledBets.reduce((sum, bet) => sum + bet.betSize, 0)
  const roi = totalWagered > 0 ? (totalPL / totalWagered) * 100 : 0

  return {
    currentBankroll: user.currentBankroll,
    totalPL,
    plPercentage,
    winRate,
    recentWinRate5,
    recentWinRate10,
    recentWinRate25,
    roi,
  }
}

/**
 * Get win rate breakdown by sport
 */
export async function getWinRateBySport(
  userId: string
): Promise<WinRateBySport[]> {
  const bets = await prisma.bet.findMany({
    where: {
      userId,
      status: { in: ['Won', 'Lost', 'Push'] },
    },
  })

  const sportStats = new Map<string, WinRateBySport>()

  bets.forEach((bet) => {
    if (!sportStats.has(bet.sport)) {
      sportStats.set(bet.sport, {
        sport: bet.sport,
        totalBets: 0,
        wins: 0,
        losses: 0,
        pushes: 0,
        winRate: 0,
      })
    }

    const stats = sportStats.get(bet.sport)!
    stats.totalBets++

    if (bet.status === 'Won') stats.wins++
    else if (bet.status === 'Lost') stats.losses++
    else if (bet.status === 'Push') stats.pushes++
  })

  // Calculate win rates
  const result: WinRateBySport[] = Array.from(sportStats.values()).map(
    (stats) => ({
      ...stats,
      winRate: stats.totalBets > 0 ? (stats.wins / stats.totalBets) * 100 : 0,
    })
  )

  return result.sort((a, b) => b.totalBets - a.totalBets)
}

/**
 * Get performance breakdown by confidence level
 */
export async function getPerformanceByConfidence(
  userId: string
): Promise<PerformanceByConfidence[]> {
  const bets = await prisma.bet.findMany({
    where: {
      userId,
      status: { in: ['Won', 'Lost', 'Push'] },
    },
  })

  const confidenceRanges = [
    { range: '60-70%', min: 60, max: 70 },
    { range: '70-80%', min: 70, max: 80 },
    { range: '80-90%', min: 80, max: 90 },
    { range: '90-100%', min: 90, max: 100 },
  ]

  const result: PerformanceByConfidence[] = confidenceRanges.map((range) => {
    const betsInRange = bets.filter(
      (b) => b.confidence >= range.min && b.confidence < range.max
    )
    const wins = betsInRange.filter((b) => b.status === 'Won').length

    return {
      confidenceRange: range.range,
      totalBets: betsInRange.length,
      wins,
      winRate: betsInRange.length > 0 ? (wins / betsInRange.length) * 100 : 0,
    }
  })

  return result
}

/**
 * Get bankroll history for chart
 */
export async function getBankrollHistory(
  userId: string,
  days?: number
): Promise<BankrollDataPoint[]> {
  const whereClause: any = { userId }

  if (days) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    whereClause.timestamp = { gte: startDate }
  }

  const snapshots = await prisma.bankrollSnapshot.findMany({
    where: whereClause,
    orderBy: { timestamp: 'asc' },
  })

  return snapshots.map((s) => ({
    timestamp: s.timestamp,
    bankroll: s.bankroll,
  }))
}

/**
 * Create a bankroll snapshot
 */
export async function createBankrollSnapshot(
  userId: string,
  bankroll: number
): Promise<void> {
  await prisma.bankrollSnapshot.create({
    data: {
      userId,
      bankroll,
    },
  })
}
