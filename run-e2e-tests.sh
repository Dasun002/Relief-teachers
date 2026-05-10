#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  E2E Testing with Playwright${NC}"
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

# Function to print info
print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

# Check if backend is running
print_header "Checking Backend Status"
if lsof -ti:5000 > /dev/null 2>&1; then
    print_success "Backend is running on port 5000"
else
    print_error "Backend is NOT running on port 5000"
    print_info "Starting backend..."
    cd backend
    npm start > /dev/null 2>&1 &
    BACKEND_PID=$!
    cd ..
    sleep 5
    
    if lsof -ti:5000 > /dev/null 2>&1; then
        print_success "Backend started successfully"
    else
        print_error "Failed to start backend"
        exit 1
    fi
fi

# Check if Playwright is installed
print_header "Checking Playwright Installation"
cd frontend
if [ -d "node_modules/@playwright" ]; then
    print_success "Playwright is installed"
else
    print_error "Playwright is NOT installed"
    print_info "Installing Playwright..."
    npm install -D @playwright/test
    npx playwright install chromium
fi

# Run E2E tests
print_header "Running E2E Tests"
echo ""

# Check for command line arguments
if [ "$1" == "--ui" ]; then
    print_info "Running tests in UI mode..."
    npm run test:e2e:ui
elif [ "$1" == "--headed" ]; then
    print_info "Running tests in headed mode..."
    npm run test:e2e:headed
elif [ "$1" == "--debug" ]; then
    print_info "Running tests in debug mode..."
    npm run test:e2e:debug
else
    print_info "Running all E2E tests..."
    npm run test:e2e
fi

TEST_EXIT_CODE=$?

cd ..

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Test Results${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "ALL E2E TESTS PASSED! ✓"
    echo ""
    print_info "View detailed report: cd frontend && npm run test:report"
else
    print_error "SOME E2E TESTS FAILED ✗"
    echo ""
    print_info "View detailed report: cd frontend && npm run test:report"
    print_info "Debug failed tests: cd frontend && npm run test:e2e:debug"
fi

echo ""
echo -e "${CYAN}Test Modes:${NC}"
echo -e "  ${CYAN}./run-e2e-tests.sh${NC}          - Run all tests (headless)"
echo -e "  ${CYAN}./run-e2e-tests.sh --ui${NC}     - Run with interactive UI"
echo -e "  ${CYAN}./run-e2e-tests.sh --headed${NC} - Run with visible browser"
echo -e "  ${CYAN}./run-e2e-tests.sh --debug${NC}  - Run in debug mode"
echo ""

exit $TEST_EXIT_CODE
