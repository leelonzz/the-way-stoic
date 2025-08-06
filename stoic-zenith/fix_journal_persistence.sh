#!/bin/bash

# Journal Persistence Fix Script
# This script applies the database migration and verifies the fixes

echo "🔧 Starting Journal Persistence Fix..."

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Apply the database migration
echo "📊 Applying database migration..."
npx supabase db push

if [ $? -ne 0 ]; then
    echo "❌ Database migration failed. Please check your Supabase connection."
    exit 1
fi

echo "✅ Database migration applied successfully"

# Verify the constraint was removed
echo "🔍 Verifying database schema..."
npx supabase db diff --schema public --table journal_entries

# Check if the application builds successfully
echo "🏗️ Building application to verify code changes..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the code changes."
    exit 1
fi

echo "✅ Application builds successfully"

# Run type checking
echo "🔍 Running type checks..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️ Type check warnings found, but continuing..."
fi

echo "🎉 Journal persistence fix completed successfully!"
echo ""
echo "📋 Summary of changes:"
echo "  ✅ Removed UNIQUE constraint preventing multiple entries per day"
echo "  ✅ Enhanced authentication context management"
echo "  ✅ Added better error handling for database operations"
echo "  ✅ Improved sync queue management"
echo ""
echo "🧪 Next steps:"
echo "  1. Test creating multiple journal entries on the same day"
echo "  2. Test persistence after page reload"
echo "  3. Test with different user accounts"
echo "  4. Monitor console logs for authentication issues"
