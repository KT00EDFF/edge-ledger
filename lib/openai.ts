import OpenAI from 'openai'
import { PredictionResult, MatchupInput } from '@/types'
import { generateMockPrediction } from './mock-data'

// Only initialize OpenAI client if API key is present
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

/**
 * Generate AI prediction for a sports matchup
 * Falls back to mock data if OPENAI_API_KEY is not configured
 */
export async function generatePrediction(
  matchup: MatchupInput
): Promise<PredictionResult> {
  // Use mock data if OpenAI API key is not configured
  if (!openai || !process.env.OPENAI_API_KEY) {
    console.log('📊 Using mock prediction data (OPENAI_API_KEY not configured)')
    // Simulate API delay for realistic UX
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
            'You are an expert sports analyst with deep knowledge of statistics, team dynamics, and betting strategies. Provide detailed, data-driven predictions.',
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

    const prediction: PredictionResult = JSON.parse(responseText)

    // Validate the response
    if (
      !prediction.prediction ||
      typeof prediction.confidence !== 'number' ||
      !prediction.reasoning
    ) {
      throw new Error('Invalid prediction response format')
    }

    // Ensure confidence is between 0 and 100
    prediction.confidence = Math.max(0, Math.min(100, prediction.confidence))

    return prediction
  } catch (error) {
    console.error('Error generating prediction:', error)
    // Fall back to mock data on error
    console.log('⚠️  OpenAI API error, falling back to mock data')
    return generateMockPrediction(matchup)
  }
}

/**
 * Build the prediction prompt for OpenAI
 */
function buildPredictionPrompt(matchup: MatchupInput): string {
  const { sport, homeTeam, awayTeam, gameDate } = matchup

  return `You are an expert sports analyst. Analyze the following matchup and provide a detailed prediction.

Sport: ${sport}
Home Team: ${homeTeam}
Away Team: ${awayTeam}
Date: ${gameDate}

Please provide:
1. Your prediction (Home Win/Away Win/Draw or Over/Under for totals)
2. Confidence level (0-100%)
3. Detailed reasoning for your prediction
4. Key factors influencing your prediction (3-5 bullet points)
5. Any concerns or uncertainties

Consider:
- Recent team performance and form
- Head-to-head history
- Home/away splits and advantage
- Injuries and lineup changes
- Motivation factors (playoff implications, rivalry, etc.)
- Weather conditions (if outdoor sport)
- Rest days and schedule factors
- Coaching matchups and strategies

Format your response as JSON with the following structure:
{
  "prediction": "Home Win" | "Away Win" | "Draw" | "Over" | "Under",
  "confidence": 75,
  "reasoning": "Detailed explanation of your prediction...",
  "keyFactors": [
    "Factor 1 description",
    "Factor 2 description",
    "Factor 3 description"
  ],
  "concerns": "Any uncertainties or concerns about this prediction..."
}

Be honest about your confidence level. Don't inflate it if there's significant uncertainty.`
}
