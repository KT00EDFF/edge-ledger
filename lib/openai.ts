import OpenAI from 'openai'
import { PredictionResult, MatchupInput } from '@/types'
import { generateMockPrediction } from './mock-data'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

export async function generatePrediction(
  matchup: MatchupInput
): Promise<PredictionResult> {
  if (!openai || !process.env.OPENAI_API_KEY) {
    console.log('Using mock prediction data (OPENAI_API_KEY not configured)')
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return generateMockPrediction(matchup)
  }

  const prompt = buildPredictionPrompt(matchup)

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert sports analyst with deep knowledge of statistics, team dynamics, and betting strategies. Provide detailed, data-driven predictions with actionable betting recommendations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    const rawPrediction = JSON.parse(responseText)
    
    const prediction: PredictionResult = {
      predictedWinner: rawPrediction.predictedWinner || rawPrediction.prediction || matchup.homeTeam,
      confidence: Math.max(0, Math.min(100, rawPrediction.confidence || 50)),
      predictedScore: rawPrediction.predictedScore,
      analysis: rawPrediction.analysis || rawPrediction.reasoning || '',
      keyFactors: rawPrediction.keyFactors || [],
      recommendedBet: {
        betType: validateBetType(rawPrediction.recommendedBet?.betType),
        selection: rawPrediction.recommendedBet?.selection || rawPrediction.predictedWinner || matchup.homeTeam,
        line: rawPrediction.recommendedBet?.line,
        reasoning: rawPrediction.recommendedBet?.reasoning || 'Best value based on current analysis'
      }
    }

    return prediction
  } catch (error) {
    console.error('Error generating prediction:', error)
    console.log('OpenAI API error, falling back to mock data')
    return generateMockPrediction(matchup)
  }
}

function validateBetType(betType: string | undefined): 'moneyline' | 'spread' | 'total' {
  const validTypes = ['moneyline', 'spread', 'total']
  if (betType && validTypes.includes(betType.toLowerCase())) {
    return betType.toLowerCase() as 'moneyline' | 'spread' | 'total'
  }
  return 'moneyline'
}

function buildPredictionPrompt(matchup: MatchupInput): string {
  const { sport, homeTeam, awayTeam, gameDate } = matchup

  return `Analyze this ${sport} matchup and provide a prediction with a specific betting recommendation.

Home Team: ${homeTeam}
Away Team: ${awayTeam}
Date: ${gameDate}

Provide your analysis in the following JSON format:
{
  "predictedWinner": "Team name that you predict will win",
  "confidence": 75,
  "predictedScore": {
    "home": 24,
    "away": 17
  },
  "analysis": "Detailed explanation of your prediction covering key matchup factors, recent form, and strategic considerations",
  "keyFactors": [
    "Key factor 1",
    "Key factor 2", 
    "Key factor 3"
  ],
  "recommendedBet": {
    "betType": "moneyline" | "spread" | "total",
    "selection": "The specific bet (e.g., 'Chiefs -3.5', 'Over 47.5', 'Patriots ML')",
    "line": 3.5,
    "reasoning": "Why this specific bet offers the best value"
  }
}

For recommendedBet:
- betType must be one of: "moneyline", "spread", or "total"
- selection should be the specific bet description users can look for
- line is optional, include if spread or total
- reasoning should explain why this bet type offers better value than alternatives

Consider which bet type offers the best value:
- Moneyline: Best when you're very confident in the winner
- Spread: Best when margin of victory is predictable
- Total: Best when the pace/scoring of the game is more predictable than the winner

Be honest about confidence levels. Recommend the bet type where your edge is strongest.`
}
