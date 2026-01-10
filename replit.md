# Edge Ledger - Sports Betting Analytics Platform

## Overview

Edge Ledger is a full-stack AI-powered sports betting analytics platform built with Next.js 14. The application helps users track betting performance through AI-powered match predictions (GPT-4), real-time odds aggregation from multiple sportsbooks, smart bet sizing recommendations, and comprehensive bankroll management with performance analytics.

The platform supports a complete betting workflow: enter matchup details → get AI prediction with confidence level → view odds from multiple sportsbooks → confirm bet with smart sizing → track performance on dashboard. It includes a mock data mode for development when API keys aren't configured.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router and TypeScript
- **Styling**: Tailwind CSS with custom dark theme (custom color palette defined in tailwind.config.ts)
- **State Management**: Zustand for client-side state, React Query (@tanstack/react-query) for server state
- **Forms**: react-hook-form for form handling
- **Charts**: Recharts for performance visualization
- **Design**: Dark theme UI with responsive design, custom component classes (card, btn-primary, etc.)

### Backend Architecture
- **API Routes**: Next.js API routes in app/api/ directory
- **Database ORM**: Prisma with PostgreSQL
- **Validation**: Zod schemas for input validation (lib/validation.ts)
- **Environment**: Validated at startup via lib/env.ts

### Core Features Implementation
1. **Prediction Engine** (lib/openai.ts): GPT-4 integration for match predictions with confidence levels
2. **Odds Aggregation** (lib/odds-api.ts): Integration with The Odds API for real-time sportsbook odds
3. **Bet Sizing** (lib/bet-sizing.ts): Confidence-based sizing and Kelly Criterion implementation
4. **Analytics** (lib/analytics.ts): Dashboard metrics, win rates, and bankroll tracking

### Mock Data System
- Falls back to mock predictions and odds when API keys aren't configured (lib/mock-data.ts)
- Allows full development workflow without external dependencies

### Deployment Configuration
- Standalone Next.js output for Docker deployment
- Multi-stage Dockerfile with non-root user security
- Docker Compose setup with PostgreSQL 16 Alpine

## External Dependencies

### Required Services
- **PostgreSQL**: Primary database (configured via DATABASE_URL)
- **Prisma**: ORM for database operations with schema in prisma/schema.prisma

### Optional API Integrations
- **OpenAI API** (OPENAI_API_KEY): GPT-4 for match predictions - falls back to mock data if not configured
- **The Odds API** (ODDS_API_KEY): Real-time odds from sportsbooks - falls back to mock data if not configured

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