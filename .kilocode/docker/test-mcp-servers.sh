#!/bin/bash

# MCP Servers Health Check and Connectivity Validation Script
# This script performs comprehensive testing of MCP server infrastructure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="mcp-infrastructure"
SERVICES=("mcp-weather" "mcp-filesystem" "mcp-git")
HEALTH_ENDPOINTS=("http://localhost:3000/health" "http://localhost:3001/health" "http://localhost:3002/health")
TEST_ENDPOINTS=(
    "http://localhost:3000/tools"  # Weather tools
    "http://localhost:3001/tools"  # Filesystem tools
    "http://localhost:3002/tools"  # Git tools
)

# Test results
PASSED=0
FAILED=0

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Function to check if Docker containers are running
check_containers_running() {
    print_status "Checking if MCP containers are running..."

    for service in "${SERVICES[@]}"; do
        if docker ps --filter "name=${PROJECT_NAME}-${service}" --filter "status=running" | grep -q "$service"; then
            print_success "$service container is running"
        else
            print_fail "$service container is not running"
        fi
    done
}

# Function to test health endpoints
test_health_endpoints() {
    print_status "Testing health endpoints..."

    for i in "${!HEALTH_ENDPOINTS[@]}"; do
        endpoint="${HEALTH_ENDPOINTS[$i]}"
        service="${SERVICES[$i]}"

        if curl -f -s --max-time 10 "$endpoint" >/dev/null 2>&1; then
            # Get response for additional validation
            response=$(curl -s --max-time 10 "$endpoint" 2>/dev/null)
            if echo "$response" | grep -q "ok\|healthy\|status.*ok"; then
                print_success "$service health check passed"
            else
                print_warning "$service health check returned unexpected response: $response"
                print_success "$service health endpoint is accessible"
            fi
        else
            print_fail "$service health check failed (endpoint: $endpoint)"
        fi
    done
}

# Function to test service endpoints
test_service_endpoints() {
    print_status "Testing service endpoints..."

    for i in "${!TEST_ENDPOINTS[@]}"; do
        endpoint="${TEST_ENDPOINTS[$i]}"
        service="${SERVICES[$i]}"

        if curl -f -s --max-time 10 "$endpoint" >/dev/null 2>&1; then
            print_success "$service tools endpoint is accessible"
        else
            print_fail "$service tools endpoint failed (endpoint: $endpoint)"
        fi
    done
}

# Function to test basic MCP protocol
test_mcp_protocol() {
    print_status "Testing basic MCP protocol connectivity..."

    # Test filesystem server with a simple list directory request
    filesystem_test_payload='{
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "list_directory",
            "arguments": {
                "path": "."
            }
        }
    }'

    if curl -f -s --max-time 15 \
        -H "Content-Type: application/json" \
        -d "$filesystem_test_payload" \
        "http://localhost:3001/jsonrpc" >/dev/null 2>&1; then
        print_success "Filesystem MCP protocol test passed"
    else
        print_fail "Filesystem MCP protocol test failed"
    fi

    # Test git server with branches request
    git_test_payload='{
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "get_branches",
            "arguments": {}
        }
    }'

    if curl -f -s --max-time 15 \
        -H "Content-Type: application/json" \
        -d "$git_test_payload" \
        "http://localhost:3002/jsonrpc" >/dev/null 2>&1; then
        print_success "Git MCP protocol test passed"
    else
        print_fail "Git MCP protocol test failed"
    fi

    # Test weather server (if API key is available)
    if [ -n "$OPENWEATHER_API_KEY" ]; then
        weather_test_payload='{
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": "get_weather",
                "arguments": {
                    "location": "Prague"
                }
            }
        }'

        if curl -f -s --max-time 15 \
            -H "Content-Type: application/json" \
            -d "$weather_test_payload" \
            "http://localhost:3000/jsonrpc" >/dev/null 2>&1; then
            print_success "Weather MCP protocol test passed"
        else
            print_fail "Weather MCP protocol test failed"
        fi
    else
        print_warning "Weather MCP protocol test skipped (OPENWEATHER_API_KEY not set)"
    fi
}

# Function to check network connectivity
test_network_connectivity() {
    print_status "Testing network connectivity..."

    # Check if ports are open
    for port in 3000 3001 3002; do
        if nc -z localhost $port 2>/dev/null; then
            print_success "Port $port is open and accessible"
        else
            print_fail "Port $port is not accessible"
        fi
    done
}

# Function to check logs for errors
check_logs_for_errors() {
    print_status "Checking container logs for errors..."

    for service in "${SERVICES[@]}"; do
        # Get last 50 lines of logs and check for errors
        logs=$(docker logs --tail 50 "${PROJECT_NAME}-${service}-1" 2>&1 | grep -i "error\|exception\|fail" || true)

        if [ -n "$logs" ]; then
            print_warning "$service has error messages in logs:"
            echo "$logs" | head -5
        else
            print_success "$service logs are clean (no errors found)"
        fi
    done
}

# Function to generate test report
generate_report() {
    echo
    echo "========================================"
    echo "MCP Servers Test Report"
    echo "========================================"
    echo "Total Tests Passed: $PASSED"
    echo "Total Tests Failed: $FAILED"
    echo "Total Tests Run: $((PASSED + FAILED))"
    echo

    if [ $FAILED -eq 0 ]; then
        print_success "All tests passed! MCP infrastructure is healthy."
        exit 0
    else
        print_fail "Some tests failed. Please check the output above for details."
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --verbose  Enable verbose output"
    echo "  --quick        Run only basic health checks"
    echo
    echo "Environment Variables:"
    echo "  OPENWEATHER_API_KEY  Required for weather MCP server testing"
}

# Parse command line arguments
VERBOSE=false
QUICK=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --quick)
            QUICK=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_status "Starting MCP Servers Health Check and Connectivity Validation"

    # Basic checks
    check_containers_running
    test_health_endpoints
    test_service_endpoints
    test_network_connectivity

    # Advanced tests (skip if quick mode)
    if [ "$QUICK" = false ]; then
        test_mcp_protocol
        check_logs_for_errors
    fi

    # Generate report
    generate_report
}

# Run main function
main "$@"