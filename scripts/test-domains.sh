#!/bin/bash

echo "🔍 Testing VyBzzZ Domains Configuration..."
echo "=========================================="

# Test .COM domain
echo ""
echo "📍 Testing vybzzz.com"
echo "--------------------"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://vybzzz.com 2>/dev/null)
if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
  echo "✅ vybzzz.com is accessible (HTTP $HTTP_STATUS)"
  curl -I https://vybzzz.com 2>&1 | grep -i "strict-transport-security" && echo "✅ HSTS enabled"
else
  echo "❌ vybzzz.com is not accessible (HTTP $HTTP_STATUS)"
fi

echo ""
echo "📍 Testing www.vybzzz.com"
echo "--------------------"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.vybzzz.com 2>/dev/null)
if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
  echo "✅ www.vybzzz.com is accessible (HTTP $HTTP_STATUS)"
else
  echo "❌ www.vybzzz.com is not accessible (HTTP $HTTP_STATUS)"
fi

echo ""
echo "📍 Testing api.vybzzz.com/health"
echo "--------------------"
API_RESPONSE=$(curl -s https://api.vybzzz.com/health 2>/dev/null)
if [ -n "$API_RESPONSE" ]; then
  echo "✅ API is accessible"
  echo "Response: $API_RESPONSE"
else
  echo "❌ API is not accessible"
fi

# Test .APP domain
echo ""
echo "📍 Testing vybzzz.app"
echo "--------------------"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://vybzzz.app 2>/dev/null)
if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
  echo "✅ vybzzz.app is accessible (HTTP $HTTP_STATUS)"
  HSTS=$(curl -I https://vybzzz.app 2>&1 | grep -i "strict-transport-security")
  if [ -n "$HSTS" ]; then
    echo "✅ HSTS enabled (required for .APP domains)"
  else
    echo "⚠️  HSTS not found (REQUIRED for .APP domains)"
  fi
else
  echo "❌ vybzzz.app is not accessible (HTTP $HTTP_STATUS)"
fi

# Test Deep Links files
echo ""
echo "📍 Testing Deep Links Configuration"
echo "--------------------"

echo "iOS Universal Links (AASA):"
AASA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://vybzzz.app/.well-known/apple-app-site-association 2>/dev/null)
if [ "$AASA_STATUS" = "200" ]; then
  echo "✅ apple-app-site-association is accessible"
  curl -s https://vybzzz.app/.well-known/apple-app-site-association | head -5
else
  echo "❌ apple-app-site-association not found (HTTP $AASA_STATUS)"
fi

echo ""
echo "Android App Links (assetlinks.json):"
ASSETLINKS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://vybzzz.app/.well-known/assetlinks.json 2>/dev/null)
if [ "$ASSETLINKS_STATUS" = "200" ]; then
  echo "✅ assetlinks.json is accessible"
  curl -s https://vybzzz.app/.well-known/assetlinks.json | head -5
else
  echo "❌ assetlinks.json not found (HTTP $ASSETLINKS_STATUS)"
fi

# DNS Check
echo ""
echo "📍 DNS Resolution Check"
echo "--------------------"
echo "vybzzz.com:"
dig +short vybzzz.com 2>/dev/null || nslookup vybzzz.com 2>/dev/null | grep "Address" | tail -1

echo "api.vybzzz.com:"
dig +short api.vybzzz.com 2>/dev/null || nslookup api.vybzzz.com 2>/dev/null | grep "Address" | tail -1

echo "vybzzz.app:"
dig +short vybzzz.app 2>/dev/null || nslookup vybzzz.app 2>/dev/null | grep "Address" | tail -1

echo ""
echo "=========================================="
echo "✅ All domain tests completed"
echo ""
echo "Next steps:"
echo "1. If any test failed, check DNS_CONFIGURATION.md"
echo "2. For .APP domain, ensure HSTS is enabled"
echo "3. Update TEAM_ID in apple-app-site-association"
echo "4. Update SHA256 fingerprint in assetlinks.json"
