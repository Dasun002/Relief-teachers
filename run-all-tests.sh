#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Teacher Attendance System - Test Runner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print section header
print_header() {
    echo -e "\n${YELLOW}>>> $1${NC}\n"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Track overall status
FRONTEND_PASSED=0
BACKEND_PASSED=0

# Frontend Tests
print_header "Running Frontend Tests (Vitest)"
cd frontend
if npm test; then
    print_success "Frontend tests passed"
    FRONTEND_PASSED=1
else
    print_error "Frontend tests failed"
fi
cd ..

echo ""

# Backend Tests
print_header "Running Backend Tests (Jest)"
cd backend
if npm test; then
    print_success "Backend tests passed"
    BACKEND_PASSED=1
else
    print_error "Backend tests failed"
fi
cd ..

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ $FRONTEND_PASSED -eq 1 ]; then
    print_success "Frontend: PASSED"
else
    print_error "Frontend: FAILED"
fi

if [ $BACKEND_PASSED -eq 1 ]; then
    print_success "Backend: PASSED"
else
    print_error "Backend: FAILED"
fi

echo ""

# Overall result
if [ $FRONTEND_PASSED -eq 1 ] && [ $BACKEND_PASSED -eq 1 ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  ALL TESTS PASSED! ✓${NC}"
    echo -e "${GREEN}========================================${NC}"
    exit 0
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  SOME TESTS FAILED ✗${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi
