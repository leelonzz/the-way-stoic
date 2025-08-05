#!/bin/bash

# Add environment variables to Vercel
echo "Adding environment variables to Vercel..."

# Supabase
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6aW5keXF2endiYWVlcmxjYnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Mzg0ODIsImV4cCI6MjA2OTUxNDQ4Mn0.465X0mjMf6FrxZlqbl-8zmCcy5rvx3U8XQYeE82vwbg" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6aW5keXF2endiYWVlcmxjYnl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkzODQ4MiwiZXhwIjoyMDY5NTE0NDgyfQ.ifCSoa6ngAIoJuwJOskczjEX7f2Er3W4pvSSL_h2Zr4" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Dodo Payments
echo "oxKiND9nnyQCKyU3.pg48JLHmF9Ho3aWQyNZ3wJaiqIlNDtWAbMebXV3oBClbqikJ" | vercel env add NEXT_PUBLIC_DODO_API_KEY production

echo "your-dodo-secret-key" | vercel env add DODO_SECRET_KEY production

echo "test" | vercel env add NEXT_PUBLIC_DODO_ENVIRONMENT production

echo "whsec_1yXwYnq/eeBzKR2uIxSc4KNGfz464T0D" | vercel env add DODO_WEBHOOK_SECRET production

# App config
echo "the-way-stoic" | vercel env add NEXT_PUBLIC_APP_NAME production

echo "https://stoic-zenith-f3hng8791-leenhatlong210-3046s-projects.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production

echo "Environment variables added successfully!"
