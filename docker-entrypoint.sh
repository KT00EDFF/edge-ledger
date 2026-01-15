#!/bin/sh
set -e

echo "🚀 Starting Edge Ledger application..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
until nc -z db 5432; do
  echo "   Database is unavailable - sleeping"
  sleep 2
done
echo "✅ Database is ready!"

# Run database migrations
echo "🔧 Running database migrations..."
npx prisma migrate deploy

echo "✅ Migrations completed!"
echo "🎯 Starting Next.js server..."

# Start the Next.js server
exec node server.js
