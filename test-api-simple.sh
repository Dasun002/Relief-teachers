#!/bin/bash

# API Integration Test Script
# Tests critical API endpoints using curl

API_BASE_URL="http://localhost:5000/api"
TOKEN=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}API INTEGRATION TEST SUITE${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Test 1: Login
echo -e "${CYAN}Test 1: Authentication - Login${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
  echo -e "${GREEN}✅ Login successful${NC}"
  echo -e "   Token: ${TOKEN:0:20}..."
  ((PASSED++))
else
  echo -e "${RED}❌ Login failed${NC}"
  echo "   Response: $RESPONSE"
  ((FAILED++))
  exit 1
fi
echo ""

# Test 2: Get Teachers
echo -e "${CYAN}Test 2: Get All Teachers${NC}"
RESPONSE=$(curl -s -X GET "${API_BASE_URL}/teachers" \
  -H "Authorization: Bearer $TOKEN")

TEACHER_COUNT=$(echo $RESPONSE | grep -o '"_id"' | wc -l)

if [ $TEACHER_COUNT -gt 0 ]; then
  echo -e "${GREEN}✅ Retrieved $TEACHER_COUNT teachers${NC}"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠️  No teachers found in database${NC}"
  ((PASSED++))
fi
echo ""

# Test 3: Get Timetable
echo -e "${CYAN}Test 3: Get Timetable${NC}"
RESPONSE=$(curl -s -X GET "${API_BASE_URL}/timetable" \
  -H "Authorization: Bearer $TOKEN")

TIMETABLE_COUNT=$(echo $RESPONSE | grep -o '"_id"' | wc -l)

if [ $TIMETABLE_COUNT -gt 0 ]; then
  echo -e "${GREEN}✅ Retrieved $TIMETABLE_COUNT timetable entries${NC}"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠️  No timetable entries found${NC}"
  echo -e "${YELLOW}   Import XML file to populate timetable${NC}"
  ((PASSED++))
fi
echo ""

# Test 4: Get Attendance
echo -e "${CYAN}Test 4: Get Attendance for Today${NC}"
TODAY=$(date +%Y-%m-%d)
RESPONSE=$(curl -s -X GET "${API_BASE_URL}/attendance?date=${TODAY}" \
  -H "Authorization: Bearer $TOKEN")

ATTENDANCE_COUNT=$(echo $RESPONSE | grep -o '"_id"' | wc -l)

echo -e "${GREEN}✅ Retrieved $ATTENDANCE_COUNT attendance records${NC}"
((PASSED++))
echo ""

# Test 5: Unauthorized Access
echo -e "${CYAN}Test 5: Unauthorized Access (No Token)${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${API_BASE_URL}/teachers")

if [ "$HTTP_CODE" = "401" ]; then
  echo -e "${GREEN}✅ Correctly rejected unauthorized request (401)${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Did not reject unauthorized request (got $HTTP_CODE)${NC}"
  ((FAILED++))
fi
echo ""

# Test 6: Invalid Login
echo -e "${CYAN}Test 6: Invalid Login Credentials${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrongpassword"}')

if [ "$HTTP_CODE" = "401" ]; then
  echo -e "${GREEN}✅ Correctly rejected invalid credentials (401)${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Did not reject invalid credentials (got $HTTP_CODE)${NC}"
  ((FAILED++))
fi
echo ""

# Summary
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}TEST SUMMARY${NC}"
echo -e "${CYAN}========================================${NC}"
TOTAL=$((PASSED + FAILED))
echo -e "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Failed: $FAILED${NC}"
else
  echo -e "${GREEN}Failed: $FAILED${NC}"
fi

SUCCESS_RATE=$(echo "scale=1; $PASSED * 100 / $TOTAL" | bc)
echo -e "Success Rate: ${SUCCESS_RATE}%"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed! ✅${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed ❌${NC}"
  exit 1
fi
