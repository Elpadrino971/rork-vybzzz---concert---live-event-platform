#!/bin/bash

# Script de test des endpoints du backend Vybzzz
# Usage: ./test-endpoints.sh [base_url]
# Exemple: ./test-endpoints.sh http://localhost:3000

BASE_URL=${1:-http://localhost:3000}
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Test des endpoints du backend Vybzzz"
echo "📍 Base URL: $BASE_URL"
echo ""

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -n "Testing $method $endpoint ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE \
            "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $http_code)"
        if [ ! -z "$description" ]; then
            echo "  → $description"
        fi
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        echo "  Response: $body"
        return 1
    fi
}

# Tests
failed=0
total=0

# Test 1: Health check
total=$((total + 1))
test_endpoint "GET" "/health" "" "Vérifie que le serveur fonctionne" || failed=$((failed + 1))

echo ""

# Test 2: Events endpoints
echo "📅 Testing Events endpoints..."
total=$((total + 1))
test_endpoint "GET" "/api/events" "" "Liste tous les événements" || failed=$((failed + 1))

total=$((total + 1))
test_endpoint "GET" "/api/events?page=1&limit=10" "" "Liste les événements avec pagination" || failed=$((failed + 1))

total=$((total + 1))
test_endpoint "GET" "/api/events?isLive=true" "" "Liste les événements en direct" || failed=$((failed + 1))

echo ""

# Test 3: Chat endpoints
echo "💬 Testing Chat endpoints..."
total=$((total + 1))
test_endpoint "POST" "/api/chat/message" \
    '{"messages":[{"role":"user","content":"Hello"}]}' \
    "Envoie un message au chat IA" || failed=$((failed + 1))

echo ""

# Test 4: Storage endpoints
echo "📦 Testing Storage endpoints..."
total=$((total + 1))
test_endpoint "GET" "/api/storage/list/event-images" "" "Liste les fichiers du bucket event-images" || failed=$((failed + 1))

echo ""

# Résumé
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les tests sont passés !${NC} ($total/$total)"
else
    echo -e "${RED}❌ $failed test(s) ont échoué${NC} ($((total - failed))/$total réussis)"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $failed

