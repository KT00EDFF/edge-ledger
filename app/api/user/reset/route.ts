import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startingBankroll } = body

    if (typeof startingBankroll !== 'number' || startingBankroll <= 0) {
      return NextResponse.json(
        { error: 'Starting bankroll must be a positive number' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: { email: 'default@edgeledger.app' }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    await prisma.bet.deleteMany({
      where: { userId: user.id }
    })

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        startingBankroll,
        currentBankroll: startingBankroll,
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Account reset successfully'
    })
  } catch (error) {
    console.error('Error resetting account:', error)
    return NextResponse.json(
      { error: 'Failed to reset account' },
      { status: 500 }
    )
  }
}
