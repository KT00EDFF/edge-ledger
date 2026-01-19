import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateProfit, calculateBankrollReturn } from '@/lib/bet-sizing'
import { createBankrollSnapshot } from '@/lib/analytics'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { result } = body // 'Won', 'Lost', or 'Push'

    if (!['Won', 'Lost', 'Push'].includes(result)) {
      return NextResponse.json({ error: 'Invalid result' }, { status: 400 })
    }

    // Get the bet
    const bet = await prisma.bet.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!bet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 })
    }

    if (bet.status !== 'Pending') {
      return NextResponse.json(
        { error: 'Bet already settled' },
        { status: 400 }
      )
    }

    // Calculate profit (net P/L for display)
    const profit = calculateProfit(bet.betSize, bet.odds, result)

    // Calculate amount to return to bankroll
    const bankrollReturn = calculateBankrollReturn(bet.betSize, bet.odds, result)

    // Update bet
    const updatedBet = await prisma.bet.update({
      where: { id },
      data: {
        status: result,
        profit,
        settledAt: new Date(),
      },
    })

    // Update user's bankroll (add back the return amount)
    const newBankroll = bet.user.currentBankroll + bankrollReturn
    await prisma.user.update({
      where: { id: bet.userId },
      data: {
        currentBankroll: newBankroll,
      },
    })

    // Create bankroll snapshot
    await createBankrollSnapshot(bet.userId, newBankroll)

    return NextResponse.json({
      bet: updatedBet,
      newBankroll,
      profit,
    })
  } catch (error) {
    console.error('Error settling bet:', error)
    return NextResponse.json({ error: 'Failed to settle bet' }, { status: 500 })
  }
}
