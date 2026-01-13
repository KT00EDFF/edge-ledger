# Edge Ledger - Sports Betting Analytics Platform

## Overview

Edge Ledger is a full-stack AI-powered sports betting analytics platform built with Next.js 16. The application helps users track betting performance through AI-powered match predictions (GPT-4), real-time odds aggregation from multiple sportsbooks, smart bet sizing recommendations, and comprehensive bankroll management with performance analytics.

The platform features a modern dark theme UI inspired by OKX.com's trading dashboard aesthetic. Users can browse live matchups from ESPN, view real-time odds from multiple sportsbooks, get AI-powered predictions, and place bets with smart sizing recommendations.

## Recent Changes

### January 2026
- **New Bet Page Redesign**: Complete overhaul with live ESPN matchup browser, odds table panel, and AI insights toggle
- **ESPN Integration**: Live game data from ESPN API for NFL, NBA, MLB, NCAAF, and NCAAB
- **Horizontal Matchup Scroller**: Browse today's games with team logos, times, and sport tags
- **Odds Table Panel**: View spread, moneyline, and totals from multiple sportsbooks
- **AI Analysis Toggle**: Optional GPT-4 predictions with confidence levels and key factors
- **AI Best Bet Recommendations**: AI now recommends specific bet type (ML/Spread/Total) with selection and reasoning
- **Completed Games Filter**: ESPN data now excludes finished, postponed, and canceled games
- **Bet Confirmation Modal**: Clean modal for entering bet amount and confirming placement
- **Dark Theme**: OKX-inspired dark UI with #0b0b0b background, #141414 cards, green (#00d26a) accents
- **Mobile-Responsive Design**: Hamburger menu on mobile, responsive cards, tables, and touch-friendly UI

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 16 with App Router and TypeScript
- **Styling**: Tailwind CSS with custom dark theme (tailwind.config.ts)
- **State Management**: 
  - NewBetContext (React context + reducer) for betting workflow
  - Zustand for global client state
  - React Query for server state
- **Forms**: react-hook-form for form handling
- **Charts**: Recharts for performance visualization
- **Design**: Dark theme with custom component classes (card, btn-primary, btn-secondary, input-dark)

### Backend Architecture
- **API Routes**: Next.js API routes in app/api/ directory
- **Database ORM**: Prisma with PostgreSQL
- **Validation**: Zod schemas for input validation (lib/validation.ts)

### Core Features Implementation
1. **ESPN Integration** (app/api/espn/[sport]/route.ts): Live matchup data from ESPN scoreboard API
2. **Sports Mapper** (lib/sports-mapper.ts): Normalizes ESPN data and maps team names between APIs
3. **Prediction Engine** (lib/openai.ts): GPT-4 integration for match predictions
4. **Odds Aggregation** (app/api/odds/matchup/route.ts): Real-time odds from The Odds API
5. **Bet Sizing** (lib/bet-sizing.ts): Confidence-based sizing and Kelly Criterion
6. **Analytics** (lib/analytics.ts): Dashboard metrics, win rates, bankroll tracking

### New Bet Page Components
- **SportsSwitcher**: Toggle between NFL, NBA, MLB, NCAAF, NCAAB
- **MatchupScroller**: Horizontal scrollable game cards with team logos
- **OddsTablePanel**: Table showing bookmaker odds (Spread/ML/Total)
- **AiInsightsPanel**: Toggle-enabled AI predictions with analysis
- **BetConfirmationModal**: Modal for bet amount and confirmation

### Mock Data System
- Falls back to mock predictions and odds when API keys aren't configured
- lib/mock-data.ts for predictions, API routes generate mock odds inline

## External Dependencies

### Required Services
- **PostgreSQL**: Primary database (configured via DATABASE_URL)
- **Prisma**: ORM for database operations

### External APIs
- **ESPN Scoreboard API**: Free public API for live game data
  - Endpoint: `https://site.api.espn.com/apis/site/v2/sports/[sport]/[league]/scoreboard`
  - No API key required
- **OpenAI API** (OPENAI_API_KEY): GPT-4 for match predictions
- **The Odds API** (ODDS_API_KEY): Real-time sportsbook odds

### Key NPM Dependencies
- @prisma/client: Database ORM
- @tanstack/react-query: Server state management
- openai: OpenAI SDK for predictions
- axios: HTTP client for odds API
- zod: Schema validation
- zustand: Client state management
- recharts: Data visualization
- react-hook-form: Form handling
- date-fns: Date utilities

## File Structure

```
app/
├── api/
│   ├── espn/[sport]/route.ts    # ESPN scoreboard proxy
│   ├── odds/matchup/route.ts    # Odds API with team matching
│   ├── predictions/route.ts     # AI predictions
│   └── bets/route.ts            # Bet CRUD operations
├── new-bet/page.tsx             # New betting interface
├── bets/page.tsx                # Bet history
├── settings/page.tsx            # User settings
└── page.tsx                     # Dashboard

components/
├── bets/
│   ├── SportsSwitcher.tsx       # Sport selection tabs
│   ├── MatchupScroller.tsx      # Horizontal game cards
│   ├── OddsTablePanel.tsx       # Odds comparison table
│   ├── AiInsightsPanel.tsx      # AI toggle and predictions
│   └── BetConfirmationModal.tsx # Bet placement modal
└── layout/
    └── Navbar.tsx               # Navigation bar

lib/
├── sports-mapper.ts             # ESPN/Odds API normalization
├── new-bet-context.tsx          # Betting state management
├── openai.ts                    # AI prediction logic
├── odds-api.ts                  # Odds fetching utilities
└── mock-data.ts                 # Mock data generators
```
