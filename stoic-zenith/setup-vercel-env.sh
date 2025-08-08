#!/bin/bash

# Script to set up Vercel environment variables
echo "Setting up Vercel environment variables..."

# Read from .env.local and set each variable
echo "Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6aW5keXF2endiYWVlcmxjYnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Mzg0ODIsImV4cCI6MjA2OTUxNDQ4Mn0.465X0mjMf6FrxZlqbl-8zmCcy5rvx3U8XQYeE82vwbg" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

echo "Adding SUPABASE_SERVICE_ROLE_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6aW5keXF2endiYWVlcmxjYnl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkzODQ4MiwiZXhwIjoyMDY5NTE0NDgyfQ.ifCSoa6ngAIoJuwJOskczjEX7f2Er3W4pvSSL_h2Zr4" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

echo "Adding GEMINI_API_KEY..."
echo "AIzaSyBCzu7qqjAUA5AH9eG4mJdUvbdffvCunng" | vercel env add GEMINI_API_KEY production

echo "Adding NEXT_PUBLIC_DODO_API_KEY..."
echo "HpXOmbn1AuG0okzu.Z29TVbOH2Kvej8FpSkCWDZxlINAd1otljA_SbBUD5Nt8k71t" | vercel env add NEXT_PUBLIC_DODO_API_KEY production

echo "Adding DODO_SECRET_KEY..."
echo "your_dodo_secret_key_here" | vercel env add DODO_SECRET_KEY production

echo "Adding NEXT_PUBLIC_DODO_ENVIRONMENT..."
echo "live" | vercel env add NEXT_PUBLIC_DODO_ENVIRONMENT production

echo "Adding DODO_WEBHOOK_SECRET..."
echo "whsec_ZsX7x3kMyhpAUUI2igmiAkXsRPHKEGR4" | vercel env add DODO_WEBHOOK_SECRET production

echo "Adding RESEND_API_KEY..."
echo "re_KXaxEepL_3rrpiD26LNa9QbaQTWRDH9fg" | vercel env add RESEND_API_KEY production

echo "Adding NEXT_PUBLIC_APP_URL..."
echo "https://stoic-zenith.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production

echo "Environment variables setup complete!"
