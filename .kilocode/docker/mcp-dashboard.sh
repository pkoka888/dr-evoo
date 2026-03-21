#!/bin/bash

# MCP Services Monitoring Dashboard
# Interactive dashboard for monitoring MCP services health, logs, and metrics

set -e

# Configuration
PROJECT_NAME="mcp-infrastructure"
SERVICES=("mcp-weather" "mcp-filesystem" "mcp-git")
HEALTH_ENDPOINTS=("http://localhost:3000/health" "http://localhost:3001/health" "http://localhost:3002/health")
LOG_DIRS=("../../mcp-logs/weather" "../../mcp-logs/filesystem" "../../mcp-logs/git")
AGGREGATED_LOG_DIR="../../mcp-logs/aggregated"
METRICS_FILE="/tmp/mcp_metrics.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Dashboard state
REFRESH_INTERVAL=5
LAST_UPDATE=""

# Function to clear screen
clear_screen() {
    clear
}

# Function to print header
print_header() {
    echo -e "${WHITE}================================================================================${NC}"
    echo -e "${CYAN}                        MCP Services Monitoring Dashboard${NC}"
    echo -e "${WHITE}================================================================================${NC}"
    echo -e "${BLUE}Last Update: ${LAST_UPDATE:-Never}${NC}"
    echo
}

# Function to get service status
get_service_status() {
    local service=$1
    local container_name="${PROJECT_NAME}-${service}-1"

    if docker ps --filter "name=${container_name}" --filter "status=running" | grep -q "$service"; then
        echo "running"
    else
        echo "stopped"
    fi
}

# Function to get health status
get_health_status() {
    local endpoint=$1

    if curl -f -s --max-time 5 "$endpoint" >/dev/null 2>&1; then
        echo "healthy"
    else
        echo "unhealthy"
    fi
}

# Function to get response time
get_response_time() {
    local endpoint=$1
    local start_time=$(date +%s%N)

    if curl -f -s --max-time 5 "$endpoint" >/dev/null 2>&1; then
        local end_time=$(date +%s%N)
        local response_time=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds
        echo "${response_time}ms"
    else
        echo "N/A"
    fi
}

# Function to get error count from logs
get_error_count() {
    local service=$1
    local log_dir=$2

    local error_count=0

    # Check Docker logs for errors (last 1 hour)
    if docker ps --filter "name=${PROJECT_NAME}-${service}" | grep -q "$service"; then
        local container_errors=$(docker logs --since 1h "${PROJECT_NAME}-${service}-1" 2>&1 | grep -i "error\|exception\|fail" | wc -l)
        error_count=$((error_count + container_errors))
    fi

    # Check file logs for errors
    if [ -d "$log_dir" ]; then
        local log_files=$(find "$log_dir" -name "*.log" -type f -newer $(date -d '1 hour ago' +%Y%m%d%H%M%S 2>/dev/null || echo "1 hour ago") 2>/dev/null || true)
        for log_file in $log_files; do
            if [ -f "$log_file" ]; then
                local file_errors=$(grep -i "error\|exception\|fail" "$log_file" | wc -l)
                error_count=$((error_count + file_errors))
            fi
        done
    fi

    echo "$error_count"
}

# Function to get resource usage
get_resource_usage() {
    local service=$1

    if ! docker ps --filter "name=${PROJECT_NAME}-${service}" | grep -q "$service"; then
        echo "N/A"
        return
    fi

    local stats=$(docker stats --no-stream --format "{{.CPUPerc}}|{{.MemUsage}}" "${PROJECT_NAME}-${service}-1" 2>/dev/null)
    if [ -n "$stats" ]; then
        local cpu=$(echo "$stats" | cut -d'|' -f1)
        local mem=$(echo "$stats" | cut -d'|' -f2)
        echo "CPU: $cpu, MEM: $mem"
    else
        echo "N/A"
    fi
}

# Function to print service status table
print_service_status() {
    echo -e "${WHITE}Service Status:${NC}"
    echo -e "${WHITE}--------------------------------------------------------------------------------${NC}"
    printf "${CYAN}%-15s %-10s %-10s %-12s %-8s %-20s${NC}\n" "Service" "Container" "Health" "Response" "Errors" "Resources"
    echo -e "${WHITE}--------------------------------------------------------------------------------${NC}"

    for i in "${!SERVICES[@]}"; do
        local service="${SERVICES[$i]}"
        local endpoint="${HEALTH_ENDPOINTS[$i]}"
        local log_dir="${LOG_DIRS[$i]}"

        local container_status=$(get_service_status "$service")
        local health_status=$(get_health_status "$endpoint")
        local response_time=$(get_response_time "$endpoint")
        local error_count=$(get_error_count "$service" "$log_dir")
        local resources=$(get_resource_usage "$service")

        # Color coding
        local container_color=$NC
        local health_color=$NC

        case $container_status in
            "running") container_color=$GREEN ;;
            "stopped") container_color=$RED ;;
        esac

        case $health_status in
            "healthy") health_color=$GREEN ;;
            "unhealthy") health_color=$RED ;;
        esac

        printf "%-15s ${container_color}%-10s${NC} ${health_color}%-10s${NC} %-12s %-8s %-20s\n" \
               "$service" "$container_status" "$health_status" "$response_time" "$error_count" "$resources"
    done

    echo
}

# Function to print recent logs
print_recent_logs() {
    echo -e "${WHITE}Recent Log Activity:${NC}"
    echo -e "${WHITE}--------------------------------------------------------------------------------${NC}"

    local aggregated_log="$AGGREGATED_LOG_DIR/mcp-services.log"
    if [ -f "$aggregated_log" ]; then
        echo -e "${CYAN}Last 10 log entries from aggregated log:${NC}"
        tail -10 "$aggregated_log" | while IFS= read -r line; do
            # Color code log levels
            if echo "$line" | grep -q "\[ERROR\]"; then
                echo -e "${RED}$line${NC}"
            elif echo "$line" | grep -q "\[WARN\]"; then
                echo -e "${YELLOW}$line${NC}"
            elif echo "$line" | grep -q "\[INFO\]"; then
                echo -e "${GREEN}$line${NC}"
            else
                echo "$line"
            fi
        done
    else
        echo -e "${YELLOW}No aggregated logs found. Run log aggregation first.${NC}"
    fi

    echo
}

# Function to print alerts
print_alerts() {
    echo -e "${WHITE}Active Alerts:${NC}"
    echo -e "${WHITE}--------------------------------------------------------------------------------${NC}"

    local alerts_found=false

    for i in "${!SERVICES[@]}"; do
        local service="${SERVICES[$i]}"
        local endpoint="${HEALTH_ENDPOINTS[$i]}"
        local log_dir="${LOG_DIRS[$i]}"

        local container_status=$(get_service_status "$service")
        local health_status=$(get_health_status "$endpoint")
        local error_count=$(get_error_count "$service" "$log_dir")

        if [ "$container_status" != "running" ]; then
            echo -e "${RED}🚨 $service container is $container_status${NC}"
            alerts_found=true
        fi

        if [ "$health_status" != "healthy" ]; then
            echo -e "${RED}🚨 $service health check failed${NC}"
            alerts_found=true
        fi

        if [ "$error_count" -gt 0 ]; then
            echo -e "${YELLOW}⚠️  $service has $error_count errors in recent logs${NC}"
            alerts_found=true
        fi
    done

    if [ "$alerts_found" = false ]; then
        echo -e "${GREEN}✅ No active alerts${NC}"
    fi

    echo
}

# Function to print system info
print_system_info() {
    echo -e "${WHITE}System Information:${NC}"
    echo -e "${WHITE}--------------------------------------------------------------------------------${NC}"

    # Docker info
    local container_count=$(docker ps --filter "name=${PROJECT_NAME}" | wc -l)
    container_count=$((container_count - 1))  # Subtract header line

    echo -e "${CYAN}Docker Containers:${NC} $container_count running MCP services"

    # Log file sizes
    local total_log_size=0
    for log_dir in "${LOG_DIRS[@]}"; do
        if [ -d "$log_dir" ]; then
            local dir_size=$(du -sb "$log_dir" 2>/dev/null | cut -f1 || echo "0")
            total_log_size=$((total_log_size + dir_size))
        fi
    done

    if [ -d "$AGGREGATED_LOG_DIR" ]; then
        local agg_size=$(du -sb "$AGGREGATED_LOG_DIR" 2>/dev/null | cut -f1 || echo "0")
        total_log_size=$((total_log_size + agg_size))
    fi

    local log_size_mb=$((total_log_size / 1024 / 1024))
    echo -e "${CYAN}Total Log Size:${NC} ${log_size_mb}MB"

    # Uptime
    if [ -f "/proc/uptime" ]; then
        local uptime_seconds=$(cut -d' ' -f1 /proc/uptime | cut -d'.' -f1)
        local uptime_days=$((uptime_seconds / 86400))
        local uptime_hours=$(( (uptime_seconds % 86400) / 3600 ))
        echo -e "${CYAN}System Uptime:${NC} ${uptime_days}d ${uptime_hours}h"
    fi

    echo
}

# Function to print menu
print_menu() {
    echo -e "${WHITE}Controls:${NC}"
    echo -e "${WHITE}--------------------------------------------------------------------------------${NC}"
    echo -e "${CYAN}r${NC} - Refresh dashboard"
    echo -e "${CYAN}l${NC} - View detailed logs"
    echo -e "${CYAN}m${NC} - Run monitoring check"
    echo -e "${CYAN}a${NC} - Run log aggregation"
    echo -e "${CYAN}q${NC} - Quit"
    echo -e "${WHITE}--------------------------------------------------------------------------------${NC}"
    echo -e "${BLUE}Auto-refresh: ${REFRESH_INTERVAL}s (press any key to interact)${NC}"
}

# Function to handle user input
handle_input() {
    local input=""
    read -t $REFRESH_INTERVAL -n 1 input 2>/dev/null || true

    case $input in
        "r"|""|"R")
            # Refresh (default action)
            return 0
            ;;
        "l"|"L")
            clear_screen
            echo -e "${WHITE}Detailed Logs Viewer${NC}"
            echo -e "${WHITE}==================${NC}"
            echo
            if [ -f "$AGGREGATED_LOG_DIR/mcp-services.log" ]; then
                echo -e "${CYAN}Recent logs (press Ctrl+C to return to dashboard):${NC}"
                echo
                tail -f "$AGGREGATED_LOG_DIR/mcp-services.log" || true
            else
                echo -e "${YELLOW}No aggregated logs found.${NC}"
                echo -e "${BLUE}Run log aggregation first with option 'a'.${NC}"
                sleep 3
            fi
            ;;
        "m"|"M")
            clear_screen
            echo -e "${WHITE}Running Monitoring Check...${NC}"
            if [ -f ".kilocode/docker/monitor-mcp-services.sh" ]; then
                bash .kilocode/docker/monitor-mcp-services.sh --dashboard
            else
                echo -e "${RED}Monitoring script not found.${NC}"
                sleep 2
            fi
            ;;
        "a"|"A")
            clear_screen
            echo -e "${WHITE}Running Log Aggregation...${NC}"
            if [ -f ".kilocode/docker/aggregate-mcp-logs.sh" ]; then
                bash .kilocode/docker/aggregate-mcp-logs.sh
                echo -e "${GREEN}Log aggregation completed. Press any key to continue...${NC}"
                read -n 1
            else
                echo -e "${RED}Log aggregation script not found.${NC}"
                sleep 2
            fi
            ;;
        "q"|"Q")
            echo -e "${GREEN}Exiting dashboard...${NC}"
            exit 0
            ;;
        *)
            # Invalid input, just refresh
            return 0
            ;;
    esac
}

# Function to update dashboard
update_dashboard() {
    LAST_UPDATE=$(date)
    clear_screen
    print_header
    print_service_status
    print_alerts
    print_recent_logs
    print_system_info
    print_menu
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -i, --interval SEC  Refresh interval in seconds (default: 5)"
    echo "  -s, --static        Show static dashboard (no auto-refresh)"
    echo
    echo "Interactive Controls:"
    echo "  r - Refresh dashboard"
    echo "  l - View detailed logs"
    echo "  m - Run monitoring check"
    echo "  a - Run log aggregation"
    echo "  q - Quit"
}

# Parse command line arguments
STATIC=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -i|--interval)
            REFRESH_INTERVAL="$2"
            shift 2
            ;;
        -s|--static)
            STATIC=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_usage
            exit 1
            ;;
    esac
done

# Trap Ctrl+C
trap 'echo -e "\n${GREEN}Dashboard stopped.${NC}"; exit 0' INT

# Main dashboard loop
if [ "$STATIC" = true ]; then
    update_dashboard
else
    while true; do
        update_dashboard
        handle_input
    done
fi