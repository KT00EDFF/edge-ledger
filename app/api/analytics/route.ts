import { NextRequest, NextResponse } from 'next/server'
import {
  calculateDashboardMetrics,
  getWinRateBySport,
  getPerformanceByConfidence,
  getBankrollHistory,
} from '@/lib/analytics'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'dashboard', 'sport', 'confidence', 'bankroll'
    const days = searchParams.get('days')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    let data

    switch (type) {
      case 'dashboard':
        data = await calculateDashboardMetrics(userId)
        break
      case 'sport':
        data = await getWinRateBySport(userId)
        break
      case 'confidence':
        data = await getPerformanceByConfidence(userId)
        break
      case 'bankroll':
        data = await getBankrollHistory(userId, days ? parseInt(days) : undefined)
        break
      default:
        // Return all analytics
        const [dashboard, sport, confidence, bankroll] = await Promise.all([
          calculateDashboardMetrics(userId),
          getWinRateBySport(userId),
          getPerformanceByConfidence(userId),
          getBankrollHistory(userId),
        ])
        data = { dashboard, sport, confidence, bankroll }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
