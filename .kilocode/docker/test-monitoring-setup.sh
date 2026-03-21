#!/bin/bash

# Test script for MCP monitoring and logging setup
# This script validates that all monitoring components are working correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVICES=("mcp-weather" "mcp-filesystem" "mcp-git")
LOG_DIRS=("../../mcp-logs/weather" "../../mcp-logs/filesystem" "../../mcp-logs/git")
AGGREGATED_LOG_DIR="../../mcp-logs/aggregated"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print colored output
print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((TESTS_PASSED++))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((TESTS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Function to test script executability
test_script_executable() {
    local script=$1
    local script_name=$2

    print_status "Testing $script_name script executability..."

    if [ -f "$script" ]; then
        if head -1 "$script" | grep -q "#!/bin/bash"; then
            print_success "$script_name script exists and has shebang"
        else
            print_fail "$script_name script missing shebang"
        fi
    else
        print_fail "$script_name script not found at $script"
    fi
}

# Function to test log directories
test_log_directories() {
    print_status "Testing log directory structure..."

    local all_dirs_exist=true

    for log_dir in "${LOG_DIRS[@]}"; do
        if [ ! -d "$log_dir" ]; then
            print_warning "Log directory $log_dir does not exist (will be created when services run)"
        else
            print_success "Log directory $log_dir exists"
        fi
    done

    if [ ! -d "$AGGREGATED_LOG_DIR" ]; then
        print_warning "Aggregated log directory $AGGREGATED_LOG_DIR does not exist (will be created by aggregation script)"
    else
        print_success "Aggregated log directory $AGGREGATED_LOG_DIR exists"
    fi
}

# Function to test Docker Compose configuration
test_docker_compose_config() {
    print_status "Testing Docker Compose configuration..."

    local compose_file=".kilocode/docker/docker-compose.mcp.yml"

    if [ -f "$compose_file" ]; then
        # Check for logging configuration
        if grep -q "logging:" "$compose_file"; then
            print_success "Docker Compose has logging configuration"
        else
            print_fail "Docker Compose missing logging configuration"
        fi

        # Check for log volume mounts
        if grep -q "../../mcp-logs" "$compose_file"; then
            print_success "Docker Compose has log volume mounts"
        else
            print_fail "Docker Compose missing log volume mounts"
        fi

        # Check for health checks
        if grep -q "healthcheck:" "$compose_file"; then
            print_success "Docker Compose has health checks configured"
        else
            print_fail "Docker Compose missing health checks"
        fi
    else
        print_fail "Docker Compose file not found"
    fi
}

# Function to test base Dockerfile
test_base_dockerfile() {
    print_status "Testing base Dockerfile configuration..."

    local dockerfile=".kilocode/docker/mcp-base.Dockerfile"

    if [ -f "$dockerfile" ]; then
        # Check for logging utilities
        if grep -q "logrotate\|rsyslog" "$dockerfile"; then
            print_success "Base Dockerfile includes logging utilities"
        else
            print_fail "Base Dockerfile missing logging utilities"
        fi

        # Check for log directory creation
        if grep -q "mkdir.*logs" "$dockerfile"; then
            print_success "Base Dockerfile creates log directories"
        else
            print_fail "Base Dockerfile does not create log directories"
        fi
    else
        print_fail "Base Dockerfile not found"
    fi
}

# Function to test logger implementations
test_logger_implementations() {
    print_status "Testing logger implementations..."

    local loggers=(
        ".kilocode/docker/servers/filesystem/src/utils/logger.ts"
        ".kilocode/docker/servers/git/src/utils/logger.ts"
        ".kilocode/docker/servers/weather/src/utils/logger.ts"
    )

    for logger_file in "${loggers[@]}"; do
        if [ -f "$logger_file" ]; then
            # Check for structured logging
            if grep -q "LogEntry" "$logger_file" && grep -q "JSON.stringify" "$logger_file"; then
                print_success "Logger $(basename "$(dirname "$(dirname "$logger_file")")") has structured logging"
            else
                print_fail "Logger $(basename "$(dirname "$(dirname "$logger_file")")") missing structured logging"
            fi

            # Check for file logging
            if grep -q "fs.appendFileSync" "$logger_file"; then
                print_success "Logger $(basename "$(dirname "$(dirname "$logger_file")")") has file logging"
            else
                print_fail "Logger $(basename "$(dirname "$(dirname "$logger_file")")") missing file logging"
            fi
        else
            print_fail "Logger file $logger_file not found"
        fi
    done
}

# Function to test monitoring script syntax
test_monitoring_script() {
    print_status "Testing monitoring script syntax..."

    local script=".kilocode/docker/monitor-mcp-services.sh"

    if [ -f "$script" ]; then
        # Basic syntax check
        if bash -n "$script" 2>/dev/null; then
            print_success "Monitoring script has valid syntax"
        else
            print_fail "Monitoring script has syntax errors"
        fi

        # Check for key functions
        if grep -q "perform_monitoring" "$script"; then
            print_success "Monitoring script has perform_monitoring function"
        else
            print_fail "Monitoring script missing perform_monitoring function"
        fi
    else
        print_fail "Monitoring script not found"
    fi
}

# Function to test aggregation script syntax
test_aggregation_script() {
    print_status "Testing log aggregation script syntax..."

    local script=".kilocode/docker/aggregate-mcp-logs.sh"

    if [ -f "$script" ]; then
        # Basic syntax check
        if bash -n "$script" 2>/dev/null; then
            print_success "Log aggregation script has valid syntax"
        else
            print_fail "Log aggregation script has syntax errors"
        fi

        # Check for key functions
        if grep -q "perform_aggregation" "$script"; then
            print_success "Aggregation script has perform_aggregation function"
        else
            print_fail "Aggregation script missing perform_aggregation function"
        fi
    else
        print_fail "Log aggregation script not found"
    fi
}

# Function to test dashboard script syntax
test_dashboard_script() {
    print_status "Testing dashboard script syntax..."

    local script=".kilocode/docker/mcp-dashboard.sh"

    if [ -f "$script" ]; then
        # Basic syntax check
        if bash -n "$script" 2>/dev/null; then
            print_success "Dashboard script has valid syntax"
        else
            print_fail "Dashboard script has syntax errors"
        fi

        # Check for key functions
        if grep -q "update_dashboard" "$script"; then
            print_success "Dashboard script has update_dashboard function"
        else
            print_fail "Dashboard script missing update_dashboard function"
        fi
    else
        print_fail "Dashboard script not found"
    fi
}

# Function to generate test report
generate_test_report() {
    echo
    echo "========================================"
    echo "MCP Monitoring Setup Test Report"
    echo "========================================"
    echo "Tests Passed: $TESTS_PASSED"
    echo "Tests Failed: $TESTS_FAILED"
    echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
    echo

    if [ $TESTS_FAILED -eq 0 ]; then
        print_success "All tests passed! MCP monitoring setup is ready."
        echo
        echo "Next steps:"
        echo "1. Start MCP services: docker-compose -f .kilocode/docker/docker-compose.mcp.yml up -d"
        echo "2. Run initial monitoring: bash .kilocode/docker/monitor-mcp-services.sh"
        echo "3. Start log aggregation: bash .kilocode/docker/aggregate-mcp-logs.sh --continuous"
        echo "4. Launch dashboard: bash .kilocode/docker/mcp-dashboard.sh"
        exit 0
    else
        print_fail "Some tests failed. Please review the output above and fix the issues."
        exit 1
    fi
}

# Main test execution
main() {
    print_status "Starting MCP monitoring and logging setup tests..."
    echo

    # Test script executability
    test_script_executable ".kilocode/docker/monitor-mcp-services.sh" "monitoring"
    test_script_executable ".kilocode/docker/aggregate-mcp-logs.sh" "log aggregation"
    test_script_executable ".kilocode/docker/mcp-dashboard.sh" "dashboard"

    # Test directory structure
    test_log_directories

    # Test configuration files
    test_docker_compose_config
    test_base_dockerfile

    # Test implementations
    test_logger_implementations

    # Test script syntax
    test_monitoring_script
    test_aggregation_script
    test_dashboard_script

    # Generate report
    generate_test_report
}

# Run main function
main "$@"