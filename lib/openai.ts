import OpenAI from 'openai'
import { PredictionResult, MatchupInput } from '@/types'

// Sport-specific analysis factors for sharp betting
const SPORT_ANALYSIS_CONFIG: Record<string, {
  keyMetrics: string[]
  situationalFactors: string[]
  keyNumbers: string[]
  publicBiases: string[]
  sharpIndicators: string[]
}> = {
  NFL: {
    keyMetrics: [
      'Offensive/defensive DVOA rankings',
      'Red zone efficiency (offense and defense)',
      'Turnover differential and takeaway rate',
      'Third-down conversion rates',
      'Yards per play differential',
      'Pressure rate and sack percentage',
      'Run vs pass efficiency splits'
    ],
    situationalFactors: [
      'Days of rest between games',
      'Travel distance and time zone changes',
      'Primetime vs day game performance',
      'Division rivalry games (often tighter margins)',
      'Coming off bye week vs short week',
      'Outdoor weather conditions (wind, cold, rain)',
      'Revenge spots and letdown spots',
      'Look-ahead spots before big games'
    ],
    keyNumbers: [
      '3 and 7 are key numbers (field goal and touchdown margins)',
      '-3 is the most common final margin',
      'Totals landing on 41, 43, 44, 51 are common',
      'Home field advantage worth ~2.5-3 points historically (declining)'
    ],
    publicBiases: [
      'Public overvalues recent offensive explosions',
      'Public fades teams after embarrassing losses',
      'Public loves favorites, especially at home',
      'Public overreacts to quarterback changes',
      'Prime time games get inflated lines due to public action'
    ],
    sharpIndicators: [
      'Reverse line movement (line moves against heavy public %)',
      'Steam moves from respected books',
      'Opening line value vs current line',
      'Bet % vs money % discrepancy'
    ]
  },
  NBA: {
    keyMetrics: [
      'Offensive and defensive rating (per 100 possessions)',
      'Pace of play (possessions per game)',
      'Effective field goal percentage (eFG%)',
      'Turnover percentage',
      'Rebounding rate (offensive and defensive)',
      'Free throw rate and accuracy',
      'Three-point attempt rate and percentage',
      'Points in the paint differential'
    ],
    situationalFactors: [
      'Back-to-back games (2nd night fatigue)',
      'Days of rest (0, 1, 2, 3+)',
      '4-in-5 or 5-in-7 scheduling clusters',
      'Cross-country travel and time zones',
      'Altitude games (Denver)',
      'Revenge games and playoff seeding implications',
      'Load management and star player rest patterns',
      'Home vs road performance splits'
    ],
    keyNumbers: [
      'Home court advantage worth ~3-4 points (declining in modern NBA)',
      'Totals are high variance; look for pace mismatches',
      'First half vs full game often tells different story',
      'Large favorites (-10+) often fail to cover'
    ],
    publicBiases: [
      'Public overvalues star power and big names',
      'Public ignores rest and travel advantages',
      'Public chases high-scoring games (overs)',
      'Public fades teams after blowout losses',
      'Public loves home favorites'
    ],
    sharpIndicators: [
      'Line movement in final 90 minutes before tip',
      'Bet % vs money % divergence',
      'Reverse line movement',
      'Second-half betting patterns'
    ]
  },
  MLB: {
    keyMetrics: [
      'Starting pitcher ERA, WHIP, FIP, xFIP',
      'Pitcher strikeout rate (K/9) and walk rate (BB/9)',
      'Bullpen ERA and recent workload (days rest)',
      'Team batting average vs handedness (L/R splits)',
      'Isolated power (ISO) and slugging percentage',
      'On-base percentage and OPS',
      'Defensive runs saved and fielding efficiency',
      'Base running metrics (stolen bases, extra bases taken)'
    ],
    situationalFactors: [
      'Day game after night game fatigue',
      'Travel and time zone changes',
      'Pitcher workload and days rest',
      'Bullpen availability after extra-inning games',
      'Weather: wind direction/speed, temperature, humidity',
      'Ballpark factors (hitter-friendly vs pitcher-friendly)',
      'Umpire tendencies (strike zone size)',
      'Interleague play adjustments'
    ],
    keyNumbers: [
      'Run line (-1.5/+1.5) value vs moneyline',
      'First 5 innings (F5) isolates starting pitchers',
      '7-8-9 innings often where games are decided',
      'Home field advantage minimal (~54% win rate)'
    ],
    publicBiases: [
      'Public overvalues team win streaks',
      'Public fades teams after getting shutout',
      'Public bets favorites too heavily',
      'Public ignores bullpen fatigue',
      'Public overreacts to single-game performances'
    ],
    sharpIndicators: [
      'Line movement despite balanced betting percentages',
      'Money coming in on road underdogs',
      'F5 line movement diverging from full game',
      'Steam moves at market opening'
    ]
  },
  NCAAF: {
    keyMetrics: [
      'SP+ and FEI ratings (advanced efficiency)',
      'Yards per play offense and defense',
      'Explosive play rate (20+ yard gains)',
      'Turnover margin and havoc rate',
      'Red zone efficiency',
      'Third-down conversion rates',
      'Rushing vs passing efficiency balance'
    ],
    situationalFactors: [
      'Conference vs non-conference games',
      'Rivalry week motivation',
      'Bye weeks and extra preparation time',
      'Travel for away games (some teams struggle)',
      'Weather conditions (cold, wind, rain)',
      'Night games vs noon kickoffs',
      'Trap games before marquee matchups',
      'Bowl game motivation and opt-outs'
    ],
    keyNumbers: [
      '3 and 7 still key like NFL',
      'Larger spreads more common (20+ point favorites)',
      'Totals more volatile due to talent gaps',
      'Home field worth 3-4 points on average (varies by stadium)'
    ],
    publicBiases: [
      'Public overvalues blue blood programs (Alabama, Ohio State)',
      'Public ignores G5 teams with strong metrics',
      'Public loves big favorites to cover large spreads',
      'Public overreacts to marquee wins/losses',
      'Public ignores coaching changes mid-season'
    ],
    sharpIndicators: [
      'Money on underdogs with strong underlying metrics',
      'Unders in games with inflated totals',
      'Fading public teams in primetime',
      'Conference underdog value'
    ]
  },
  NCAAB: {
    keyMetrics: [
      'KenPom rankings (AdjO, AdjD, AdjT)',
      'Effective field goal percentage (eFG%)',
      'Turnover percentage (offense and defense)',
      'Offensive and defensive rebounding rate',
      'Free throw rate (attempts and percentage)',
      'Three-point shooting and defense',
      'Assist-to-turnover ratio',
      'Block and steal percentages'
    ],
    situationalFactors: [
      'Conference tournament fatigue',
      'Travel distance for away games',
      'Revenge spots and rivalry games',
      'Back-to-back tournament games',
      'Rest days between games',
      'Early season non-conference scheduling',
      'Senior night motivation',
      'NCAA Tournament seeding implications'
    ],
    keyNumbers: [
      'Home court worth 3-4 points on average',
      'Smaller gyms can inflate home advantage to 5-6 points',
      '12-5 upset rate in March around 35%',
      'Conference games often tighter than non-conference'
    ],
    publicBiases: [
      'Public loves big-name programs',
      'Public undervalues mid-majors with strong KenPom',
      'Public chases March Madness narratives',
      'Public overreacts to single-game performances',
      'Public ignores tempo differences'
    ],
    sharpIndicators: [
      'KenPom mismatches not reflected in line',
      'Line movement favoring underdogs',
      'Tempo-based total betting edges',
      'Conference tournament fade opportunities'
    ]
  }
}

const SHARP_SYSTEM_PROMPT = `You are an elite sports betting analyst who thinks like a sharp bettor. Your goal is NOT just to pick winners—it's to find VALUE where the betting market has mispriced a game.

## Your Core Philosophy:
1. **Value Over Winners**: A 60% likely winner at -200 is worse than a 45% underdog at +180
2. **Contrarian Thinking**: When everyone loves a team, ask why the line isn't higher
3. **Situational Edges**: Rest, travel, motivation, and scheduling create exploitable spots
4. **Key Numbers Matter**: In football, 3 and 7 are crucial. Don't ignore line value around these
5. **Fade the Public**: Recreational bettors have predictable biases. Exploit them
6. **Confidence = Edge Size**: Your confidence should reflect how mispriced the line is, not just win probability

## Your Analysis Framework:
1. First, identify the TRUE probability of each outcome based on metrics
2. Then, assess if the current betting line reflects that probability
3. Look for DISCREPANCIES between your fair line and the market line
4. Factor in situational edges that the market may undervalue
5. Identify public biases that may have inflated/deflated lines
6. Recommend the bet with the LARGEST EDGE, not necessarily the most likely winner

## Confidence Scoring (Based on Edge, Not Win Probability):
- 80-95%: Clear mispricing with strong situational support (rare, 1-2 per week)
- 65-79%: Solid edge with supporting factors
- 50-64%: Slight edge, proceed with caution
- Below 50%: No clear edge, consider passing

## Response Requirements:
- Be honest when there's no edge
- Explain WHY the market might be wrong
- Quantify edges when possible ("line should be -5, it's -3")
- Call out public bias explicitly
- Identify the specific bet type (spread/ML/total) with the best value`

export async function generatePrediction(
  matchup: MatchupInput
): Promise<PredictionResult> {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured. Please add your OpenAI API key in Settings > Secrets.')
  }

  const openai = new OpenAI({ apiKey })
  const prompt = buildPredictionPrompt(matchup)

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: SHARP_SYSTEM_PROMPT,
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
    throw new Error('No response received from AI model')
  }

  const rawPrediction = JSON.parse(responseText)
  
  const prediction: PredictionResult = {
    predictedWinner: rawPrediction.predictedWinner || rawPrediction.prediction || matchup.homeTeam,
    confidence: Math.max(0, Math.min(100, rawPrediction.confidence || 50)),
    predictedScore: rawPrediction.predictedScore,
    analysis: rawPrediction.analysis || rawPrediction.reasoning || '',
    keyFactors: rawPrediction.keyFactors || [],
    edgeAnalysis: rawPrediction.edgeAnalysis || null,
    recommendedBet: {
      betType: validateBetType(rawPrediction.recommendedBet?.betType),
      selection: rawPrediction.recommendedBet?.selection || rawPrediction.predictedWinner || matchup.homeTeam,
      line: rawPrediction.recommendedBet?.line,
      reasoning: rawPrediction.recommendedBet?.reasoning || 'Best value based on current analysis'
    }
  }

  return prediction
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
  
  // Get sport-specific config (default to NFL if not found)
  const sportKey = sport.toUpperCase().replace(/\s+/g, '')
  const config = SPORT_ANALYSIS_CONFIG[sportKey] || SPORT_ANALYSIS_CONFIG['NFL']

  return `## ${sport.toUpperCase()} MATCHUP ANALYSIS

**Home Team:** ${homeTeam}
**Away Team:** ${awayTeam}  
**Date:** ${gameDate}

---

## SPORT-SPECIFIC FACTORS TO ANALYZE (${sport}):

### Key Performance Metrics:
${config.keyMetrics.map(m => `- ${m}`).join('\n')}

### Situational Factors to Consider:
${config.situationalFactors.map(f => `- ${f}`).join('\n')}

### Key Numbers & Market Tendencies:
${config.keyNumbers.map(n => `- ${n}`).join('\n')}

### Common Public Biases to Exploit:
${config.publicBiases.map(b => `- ${b}`).join('\n')}

### Sharp Money Indicators:
${config.sharpIndicators.map(i => `- ${i}`).join('\n')}

---

## YOUR TASK:

Analyze this matchup through the lens of a sharp bettor looking for VALUE, not just picking winners.

1. **Assess the true probability** of each team winning based on metrics
2. **Identify situational edges** (rest, travel, motivation, weather if applicable)
3. **Look for public bias** that may have inflated/deflated the line
4. **Determine the best bet type** (spread, moneyline, or total) based on where you see the largest edge
5. **Set confidence based on edge size**, not win probability

---

## REQUIRED JSON RESPONSE:

{
  "predictedWinner": "Team you expect to win outright",
  "confidence": 72,
  "predictedScore": {
    "home": 110,
    "away": 105
  },
  "edgeAnalysis": {
    "marketLine": "Current estimated market line (e.g., 'PHX -3.5')",
    "fairLine": "Your calculated fair line (e.g., 'PHX -1.5')",
    "edgePercent": 4.5,
    "publicSide": "Which side public is betting",
    "sharpSide": "Which side sharp money favors"
  },
  "analysis": "Sharp analysis explaining WHERE THE VALUE IS, not just who wins. Mention if the line is mispriced and by how much. Call out any public bias you're fading. Explain situational factors affecting this game.",
  "keyFactors": [
    "Primary edge or value driver",
    "Situational factor supporting the bet",
    "Public bias being exploited (if any)",
    "Key stat or metric supporting the play"
  ],
  "recommendedBet": {
    "betType": "spread" | "moneyline" | "total",
    "selection": "Specific selection (e.g., 'Heat +3.5', 'Under 220.5', 'Suns ML')",
    "line": -3.5,
    "reasoning": "Explain why THIS bet type offers better value than alternatives. Be specific about the edge."
  }
}

IMPORTANT: Generate realistic scores for the sport. For NBA use scores like 105-112. For NFL use 24-17. For MLB use 5-3.

---

## BET TYPE SELECTION GUIDE:

**Choose SPREAD when:**
- You have a read on the margin of victory
- The key numbers (3, 7 in football) offer value
- Underdog is live but unlikely to win outright

**Choose MONEYLINE when:**
- Underdog plus-money offers +EV despite lower win probability
- Favorite is appropriately priced but spread is risky
- High-variance sport (MLB) where upsets are common

**Choose TOTAL when:**
- Pace/tempo mismatch creates clear over/under edge
- Weather conditions (outdoor sports) affect scoring
- Scoring trends more predictable than game outcome
- Public has pushed total too high/low

---

Be honest. If there's no clear edge, say so and lower your confidence accordingly. Sharp bettors pass on games without value.`
}
