#!/usr/bin/env bash
# Team Paradox — SEO & Federation Smoke Test Suite
# Usage:
#   bash scripts/seo-smoke.sh [TARGET_URL]
#   e.g. bash scripts/seo-smoke.sh https://www.teamparadox.in
#   e.g. bash scripts/seo-smoke.sh http://localhost:3000

set -euo pipefail

TARGET="${1:-https://www.teamparadox.in}"
echo "=========================================================="
echo " Running SEO Smoke Tests against: $TARGET"
echo "=========================================================="

FAILED=0

check_endpoint() {
  local path="$1"
  local expected_text="$2"
  local url="${TARGET}${path}"
  echo -n "Testing $url ... "

  local tmp_file
  tmp_file=$(mktemp)

  local http_code
  http_code=$(curl -sL --max-time 20 -w "%{http_code}" -o "$tmp_file" "$url" 2>/dev/null || true)
  http_code="${http_code: -3}"
  if [[ -z "$http_code" ]]; then http_code="000"; fi

  if [[ "$http_code" != "200" && "$http_code" != "308" ]]; then
    echo "❌ FAILED (HTTP Status $http_code)"
    FAILED=$((FAILED + 1))
    rm -f "$tmp_file"
    return
  fi

  # Check canonical exists
  if ! grep -qi '<link[^>]*rel="canonical"' "$tmp_file"; then
    echo "❌ FAILED (Missing canonical tag)"
    FAILED=$((FAILED + 1))
    rm -f "$tmp_file"
    return
  fi

  # Check JSON-LD exists
  if ! grep -qi 'application/ld+json' "$tmp_file"; then
    echo "❌ FAILED (Missing JSON-LD schema)"
    FAILED=$((FAILED + 1))
    rm -f "$tmp_file"
    return
  fi

  # Check expected text in server HTML response
  if [[ -n "$expected_text" ]] && ! grep -qi "$expected_text" "$tmp_file"; then
    echo "❌ FAILED (Text '$expected_text' not found in server response)"
    FAILED=$((FAILED + 1))
    rm -f "$tmp_file"
    return
  fi

  echo "✅ OK ($http_code)"
  rm -f "$tmp_file"
}

echo ""
echo "--- Core Hub Routes ---"
check_endpoint "/" "Team Paradox"
check_endpoint "/network" "The Team Paradox Network"
check_endpoint "/work" "Case Studies"

echo ""
echo "--- Team Profiles (P0 Canonical & Person Schema) ---"
check_endpoint "/team/anshika" "Anshika Singh"
check_endpoint "/team/aditya" "Aditya Chaudhari"
check_endpoint "/team/om" "Om Abhishek Tripathi"
check_endpoint "/team/abhiuday" "Abhiuday Pratap Singh"
check_endpoint "/team/ananya" "Ananya Singh"

echo ""
echo "--- Case Studies (/work/*) ---"
check_endpoint "/work/theft-alert" "Theft Alert"
check_endpoint "/work/eduportal" "EduPortal"
check_endpoint "/work/aria" "ARIA"
check_endpoint "/work/perkify" "Perkify"
check_endpoint "/work/career-boost" "Career Boost"
check_endpoint "/work/local-way" "The Local Way"

echo ""
echo "--- Dynamic Robots & Sitemaps ---"
echo -n "Testing robots.txt ... "
robots=$(curl -sL --max-time 10 "${TARGET}/robots.txt" || true)
if echo "$robots" | grep -qi "Sitemap:" && echo "$robots" | grep -qi "Googlebot"; then
  echo "✅ OK"
else
  echo "❌ FAILED (robots.txt missing sitemap or search bots)"
  FAILED=$((FAILED + 1))
fi

echo -n "Testing sitemap.xml ... "
sitemap=$(curl -sL --max-time 10 "${TARGET}/sitemap.xml" || true)
if echo "$sitemap" | grep -qi "<loc>" && ! echo "$sitemap" | grep -qi "aditya.teamparadox.in"; then
  echo "✅ OK (Only hub URLs present)"
else
  echo "❌ FAILED (sitemap.xml invalid or leaking spoke hostnames)"
  FAILED=$((FAILED + 1))
fi

echo -n "Testing llms.txt ... "
llms=$(curl -sL --max-time 10 "${TARGET}/llms.txt" || true)
if echo "$llms" | grep -qi "Team Paradox" && echo "$llms" | grep -qi "Gorakhpur"; then
  echo "✅ OK"
else
  echo "❌ FAILED (llms.txt missing or empty)"
  FAILED=$((FAILED + 1))
fi

echo "=========================================================="
if [[ $FAILED -eq 0 ]]; then
  echo "🎉 All SEO smoke tests passed successfully!"
  exit 0
else
  echo "💥 $FAILED tests failed."
  exit 1
fi
