import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount } = body

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
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

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        currentBankroll: { increment: amount }
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `Added $${amount.toFixed(2)} to bankroll`
    })
  } catch (error) {
    console.error('Error adding funds:', error)
    return NextResponse.json(
      { error: 'Failed to add funds' },
      { status: 500 }
    )
  }
}
