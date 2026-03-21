#!/bin/bash

# MCP Services Comprehensive Health Monitoring and Metrics Collection Script
# This script provides detailed monitoring, metrics collection, and alerting for MCP services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="mcp-infrastructure"
SERVICES=("mcp-weather" "mcp-filesystem" "mcp-git")
HEALTH_ENDPOINTS=("http://localhost:3000/health" "http://localhost:3001/health" "http://localhost:3002/health")
LOG_DIRS=("../../mcp-logs/weather" "../../mcp-logs/filesystem" "../../mcp-logs/git")
METRICS_FILE="/tmp/mcp_metrics.json"
ALERT_THRESHOLD_ERROR_RATE=0.1  # 10% error rate threshold
ALERT_THRESHOLD_RESPONSE_TIME=5000  # 5 seconds

# Metrics storage
declare -A SERVICE_STATUS
declare -A RESPONSE_TIMES
declare -A ERROR_COUNTS
declare -A LAST_CHECK_TIME

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_metric() {
    echo -e "${CYAN}[METRIC]${NC} $1"
}

print_alert() {
    echo -e "${PURPLE}[ALERT]${NC} $1"
}

# Function to measure response time
measure_response_time() {
    local url=$1
    local start_time=$(date +%s%N)
    local http_code

    if http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null); then
        local end_time=$(date +%s%N)
        local response_time=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds
        echo "$response_time:$http_code"
    else
        echo "-1:000"  # Error case
    fi
}

# Function to check container health
check_container_health() {
    local service=$1
    local container_name="${PROJECT_NAME}-${service}-1"

    if docker ps --filter "name=${container_name}" --filter "status=running" | grep -q "$service"; then
        SERVICE_STATUS[$service]="running"
        print_success "$service container is running"
        return 0
    else
        SERVICE_STATUS[$service]="stopped"
        print_fail "$service container is not running"
        return 1
    fi
}

# Function to check health endpoints with metrics
check_health_endpoint() {
    local service=$1
    local endpoint=$2
    local index=$3

    print_status "Checking $service health endpoint..."

    local result=$(measure_response_time "$endpoint")
    local response_time=$(echo "$result" | cut -d: -f1)
    local http_code=$(echo "$result" | cut -d: -f2)

    RESPONSE_TIMES[$service]=$response_time
    LAST_CHECK_TIME[$service]=$(date +%s)

    if [ "$response_time" -eq -1 ]; then
        SERVICE_STATUS[$service]="unhealthy"
        print_fail "$service health check failed (endpoint unreachable)"
        return 1
    elif [ "$http_code" -eq 200 ]; then
        SERVICE_STATUS[$service]="healthy"
        print_success "$service health check passed (${response_time}ms)"
        return 0
    else
        SERVICE_STATUS[$service]="unhealthy"
        print_fail "$service health check failed (HTTP $http_code, ${response_time}ms)"
        return 1
    fi
}

# Function to analyze logs for errors
analyze_logs() {
    local service=$1
    local log_dir=$2

    if [ ! -d "$log_dir" ]; then
        print_warning "Log directory $log_dir does not exist for $service"
        ERROR_COUNTS[$service]=0
        return
    fi

    # Count errors in the last hour
    local error_count=0
    local total_lines=0

    # Check Docker logs for errors
    if docker ps --filter "name=${PROJECT_NAME}-${service}" | grep -q "$service"; then
        local container_logs=$(docker logs --since 1h "${PROJECT_NAME}-${service}-1" 2>&1 | grep -i "error\|exception\|fail" | wc -l)
        error_count=$((error_count + container_logs))
    fi

    # Check file logs for errors
    local log_files=$(find "$log_dir" -name "*.log" -type f -newer $(date -d '1 hour ago' +%Y%m%d%H%M) 2>/dev/null || true)
    for log_file in $log_files; do
        if [ -f "$log_file" ]; then
            local file_errors=$(grep -i "error\|exception\|fail" "$log_file" | wc -l)
            error_count=$((error_count + file_errors))
            local file_lines=$(wc -l < "$log_file")
            total_lines=$((total_lines + file_lines))
        fi
    done

    ERROR_COUNTS[$service]=$error_count

    if [ "$error_count" -gt 0 ]; then
        local error_rate=0
        if [ "$total_lines" -gt 0 ]; then
            error_rate=$((error_count * 100 / total_lines))
        fi
        print_warning "$service has $error_count errors in logs (rate: ${error_rate}%)"
    else
        print_success "$service logs are clean"
    fi
}

# Function to check resource usage
check_resource_usage() {
    local service=$1

    if ! docker ps --filter "name=${PROJECT_NAME}-${service}" | grep -q "$service"; then
        return
    fi

    local stats=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep "${PROJECT_NAME}-${service}")
    if [ -n "$stats" ]; then
        print_metric "$service resource usage: $stats"
    fi
}

# Function to generate alerts
generate_alerts() {
    print_status "Checking for alerts..."

    local alerts_generated=0

    for service in "${SERVICES[@]}"; do
        # Check error rate
        if [ "${ERROR_COUNTS[$service]}" -gt 0 ]; then
            local error_rate_threshold=$((ALERT_THRESHOLD_ERROR_RATE * 100))
            # Simplified check - if errors exist, alert
            print_alert "HIGH ERROR RATE: $service has ${ERROR_COUNTS[$service]} errors in logs"
            alerts_generated=$((alerts_generated + 1))
        fi

        # Check response time
        if [ "${RESPONSE_TIMES[$service]}" -gt "$ALERT_THRESHOLD_RESPONSE_TIME" ] 2>/dev/null; then
            print_alert "SLOW RESPONSE: $service response time ${RESPONSE_TIMES[$service]}ms exceeds threshold"
            alerts_generated=$((alerts_generated + 1))
        fi

        # Check service status
        if [ "${SERVICE_STATUS[$service]}" != "healthy" ] && [ "${SERVICE_STATUS[$service]}" != "running" ]; then
            print_alert "SERVICE DOWN: $service is ${SERVICE_STATUS[$service]}"
            alerts_generated=$((alerts_generated + 1))
        fi
    done

    if [ "$alerts_generated" -eq 0 ]; then
        print_success "No alerts generated - all services operating normally"
    fi
}

# Function to collect and save metrics
collect_metrics() {
    local metrics="{
  \"timestamp\": \"$(date -Iseconds)\",
  \"services\": {"

    local first=true
    for service in "${SERVICES[@]}"; do
        if [ "$first" = true ]; then
            first=false
        else
            metrics="${metrics},"
        fi

        metrics="${metrics}
    \"$service\": {
      \"status\": \"${SERVICE_STATUS[$service]}\",
      \"response_time_ms\": ${RESPONSE_TIMES[$service]:--1},
      \"error_count\": ${ERROR_COUNTS[$service]:-0},
      \"last_check\": ${LAST_CHECK_TIME[$service]:-0}
    }"
    done

    metrics="${metrics}
  }
}"

    echo "$metrics" > "$METRICS_FILE"
    print_metric "Metrics saved to $METRICS_FILE"
}

# Function to display dashboard
display_dashboard() {
    echo
    echo "========================================"
    echo "MCP Services Monitoring Dashboard"
    echo "========================================"
    echo "Timestamp: $(date)"
    echo

    for service in "${SERVICES[@]}"; do
        echo "Service: $service"
        echo "  Status: ${SERVICE_STATUS[$service]}"
        echo "  Response Time: ${RESPONSE_TIMES[$service]:-'N/A'} ms"
        echo "  Error Count: ${ERROR_COUNTS[$service]:-0}"
        echo "  Last Check: $(date -d "@${LAST_CHECK_TIME[$service]}" 2>/dev/null || echo 'Never')"
        echo
    done
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -d, --dashboard     Display monitoring dashboard"
    echo "  -m, --metrics       Collect and save metrics"
    echo "  -a, --alerts        Check for alerts only"
    echo "  -c, --continuous    Run continuous monitoring"
    echo "  -i, --interval SEC  Monitoring interval in seconds (default: 60)"
    echo
    echo "Environment Variables:"
    echo "  ALERT_THRESHOLD_ERROR_RATE    Error rate threshold (default: 0.1)"
    echo "  ALERT_THRESHOLD_RESPONSE_TIME Response time threshold in ms (default: 5000)"
}

# Parse command line arguments
DASHBOARD=false
METRICS=false
ALERTS_ONLY=false
CONTINUOUS=false
INTERVAL=60

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -d|--dashboard)
            DASHBOARD=true
            shift
            ;;
        -m|--metrics)
            METRICS=true
            shift
            ;;
        -a|--alerts)
            ALERTS_ONLY=true
            shift
            ;;
        -c|--continuous)
            CONTINUOUS=true
            shift
            ;;
        -i|--interval)
            INTERVAL="$2"
            shift 2
            ;;
        *)
            print_fail "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main monitoring function
perform_monitoring() {
    print_status "Starting MCP services monitoring..."

    # Check containers
    for service in "${SERVICES[@]}"; do
        check_container_health "$service"
        check_resource_usage "$service"
    done

    # Check health endpoints (only if not alerts-only mode)
    if [ "$ALERTS_ONLY" = false ]; then
        for i in "${!SERVICES[@]}"; do
            check_health_endpoint "${SERVICES[$i]}" "${HEALTH_ENDPOINTS[$i]}" "$i"
        done
    fi

    # Analyze logs
    for i in "${!SERVICES[@]}"; do
        analyze_logs "${SERVICES[$i]}" "${LOG_DIRS[$i]}"
    done

    # Generate alerts
    generate_alerts

    # Collect metrics
    if [ "$METRICS" = true ] || [ "$CONTINUOUS" = true ]; then
        collect_metrics
    fi

    # Display dashboard
    if [ "$DASHBOARD" = true ] || [ "$CONTINUOUS" = true ]; then
        display_dashboard
    fi
}

# Main execution
if [ "$CONTINUOUS" = true ]; then
    print_status "Starting continuous monitoring (interval: ${INTERVAL}s)"
    print_status "Press Ctrl+C to stop"

    while true; do
        perform_monitoring
        sleep "$INTERVAL"
        echo
    done
else
    perform_monitoring
fi