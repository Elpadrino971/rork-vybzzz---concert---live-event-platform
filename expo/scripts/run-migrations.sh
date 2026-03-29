#!/bin/bash

#
# SQL Migrations Runner for Supabase
#
# This script executes all SQL migrations in the correct order
# Run this after setting up a new Supabase project
#
# Usage:
#   ./scripts/run-migrations.sh
#   npm run migrate
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗄️  VyBzzZ Database Migration Runner${NC}\n"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI not found${NC}"
    echo -e "   Installing Supabase CLI..."
    npm install -g supabase
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo -e "${YELLOW}⚠️  Not a Supabase project${NC}"
    echo -e "   Initialize with: supabase init\n"

    read -p "Initialize Supabase project? (y/n): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        supabase init
    else
        echo -e "${RED}❌ Aborted${NC}"
        exit 1
    fi
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo -e "   Create it by copying: cp .env.example .env.local\n"
    exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Check required env vars
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ Missing Supabase credentials in .env.local${NC}"
    echo -e "   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY\n"
    exit 1
fi

echo -e "${GREEN}✅ Environment configured${NC}"
echo -e "   URL: $NEXT_PUBLIC_SUPABASE_URL\n"

# List of migrations in execution order
migrations=(
    "create_tables.sql"
    "add_atomic_transaction_functions.sql"
    "add_dashboard_optimization_functions.sql"
    "add_webhook_events_table.sql"
    "add_performance_indexes.sql"
    "add_rgpd_compliance_columns.sql"
)

# Count migrations
total=${#migrations[@]}
success=0
failed=0

echo -e "${BLUE}📦 Found $total migrations to run${NC}\n"

# Execute each migration
for i in "${!migrations[@]}"; do
    migration="${migrations[$i]}"
    number=$((i + 1))

    echo -e "${YELLOW}[$number/$total] Running: $migration${NC}"

    migration_path="supabase/migrations/$migration"

    if [ ! -f "$migration_path" ]; then
        echo -e "${RED}   ❌ File not found: $migration_path${NC}"
        failed=$((failed + 1))
        continue
    fi

    # Execute migration using Supabase CLI
    if supabase db push --db-url "$NEXT_PUBLIC_SUPABASE_URL" --file "$migration_path" 2>&1 | grep -q "Error"; then
        echo -e "${RED}   ❌ Failed to execute $migration${NC}"
        failed=$((failed + 1))
    else
        echo -e "${GREEN}   ✅ Successfully executed $migration${NC}"
        success=$((success + 1))
    fi

    echo ""
done

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Migrations completed: $success/$total${NC}"

if [ $failed -gt 0 ]; then
    echo -e "${RED}❌ Migrations failed: $failed/$total${NC}"
    echo -e "${YELLOW}\n⚠️  Some migrations failed. Check errors above.${NC}"
    exit 1
else
    echo -e "${GREEN}\n🎉 All migrations successfully executed!${NC}"
    echo -e "${BLUE}   Database is ready for use${NC}\n"
    exit 0
fi
