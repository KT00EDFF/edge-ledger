/**
 * Environment variable validation and configuration
 * Validates required environment variables and provides type-safe access
 */

interface EnvironmentConfig {
  DATABASE_URL: string
  OPENAI_API_KEY: string | undefined
  ODDS_API_KEY: string | undefined
  NEXT_PUBLIC_APP_URL: string
  NODE_ENV: 'development' | 'production' | 'test'
}

function validateEnv(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    DATABASE_URL: process.env.DATABASE_URL || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ODDS_API_KEY: process.env.ODDS_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
  }

  // Database URL is critical
  if (!config.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  // API keys are optional but will trigger mock data mode if missing
  if (!config.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not configured - using mock predictions')
  }

  if (!config.ODDS_API_KEY) {
    console.warn('⚠️  ODDS_API_KEY not configured - using mock odds')
  }

  return config
}

export const env = validateEnv()

/**
 * Check if API keys are configured
 */
export function hasApiKeys() {
  return {
    openai: Boolean(env.OPENAI_API_KEY),
    odds: Boolean(env.ODDS_API_KEY),
  }
}
