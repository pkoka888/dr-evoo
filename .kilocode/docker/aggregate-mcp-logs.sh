#!/bin/bash

# MCP Services Log Aggregation Script
# This script collects and aggregates logs from all MCP services into a centralized location

set -e

# Configuration
PROJECT_NAME="mcp-infrastructure"
SERVICES=("mcp-weather" "mcp-filesystem" "mcp-git")
LOG_DIRS=("../../mcp-logs/weather" "../../mcp-logs/filesystem" "../../mcp-logs/git")
AGGREGATED_LOG_DIR="../../mcp-logs/aggregated"
AGGREGATED_LOG_FILE="$AGGREGATED_LOG_DIR/mcp-services.log"
MAX_LOG_SIZE="100M"  # Rotate when log exceeds this size
RETENTION_DAYS=7

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to ensure aggregated log directory exists
ensure_log_directory() {
    if [ ! -d "$AGGREGATED_LOG_DIR" ]; then
        mkdir -p "$AGGREGATED_LOG_DIR"
        print_status "Created aggregated log directory: $AGGREGATED_LOG_DIR"
    fi
}

# Function to rotate logs if they exceed size limit
rotate_logs_if_needed() {
    if [ -f "$AGGREGATED_LOG_FILE" ]; then
        local log_size=$(stat -f%z "$AGGREGATED_LOG_FILE" 2>/dev/null || stat -c%s "$AGGREGATED_LOG_FILE" 2>/dev/null || echo "0")
        local max_size_bytes=$(numfmt --from=iec "$MAX_LOG_SIZE" 2>/dev/null || echo "104857600")  # Default to 100MB if numfmt not available

        if [ "$log_size" -gt "$max_size_bytes" ]; then
            local timestamp=$(date +%Y%m%d_%H%M%S)
            local rotated_file="$AGGREGATED_LOG_DIR/mcp-services.$timestamp.log"

            mv "$AGGREGATED_LOG_FILE" "$rotated_file"
            print_status "Rotated log file to: $rotated_file"

            # Compress old rotated logs
            gzip "$rotated_file" &
        fi
    fi
}

# Function to clean up old rotated logs
cleanup_old_logs() {
    print_status "Cleaning up logs older than $RETENTION_DAYS days..."

    # Find and remove old compressed logs
    find "$AGGREGATED_LOG_DIR" -name "mcp-services.*.log.gz" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

    # Find and remove old uncompressed rotated logs (in case compression failed)
    find "$AGGREGATED_LOG_DIR" -name "mcp-services.*.log" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

    print_success "Log cleanup completed"
}

# Function to collect Docker container logs
collect_docker_logs() {
    local service=$1
    local container_name="${PROJECT_NAME}-${service}-1"

    print_status "Collecting Docker logs for $service..."

    if docker ps --filter "name=${container_name}" | grep -q "$service"; then
        # Get logs from the last collection (or last 24 hours if first run)
        local since_file="$AGGREGATED_LOG_DIR/.${service}_last_collection"
        local since_option=""

        if [ -f "$since_file" ]; then
            since_option="--since $(cat "$since_file")"
        else
            since_option="--since 24h"
        fi

        # Collect logs and format them
        {
            echo "=== DOCKER LOGS: $service ==="
            docker logs $since_option --timestamps "$container_name" 2>&1 | while IFS= read -r line; do
                echo "$(date -Iseconds) [DOCKER] [$service] $line"
            done
            echo "=== END DOCKER LOGS: $service ==="
            echo
        } >> "$AGGREGATED_LOG_FILE"

        # Update last collection timestamp
        date +%Y-%m-%dT%H:%M:%S > "$since_file"

        print_success "Collected Docker logs for $service"
    else
        print_warning "Container $container_name not running, skipping Docker log collection"
    fi
}

# Function to collect file-based logs
collect_file_logs() {
    local service=$1
    local log_dir=$2

    print_status "Collecting file logs for $service from $log_dir..."

    if [ ! -d "$log_dir" ]; then
        print_warning "Log directory $log_dir does not exist for $service"
        return
    fi

    # Find all log files
    local log_files=$(find "$log_dir" -name "*.log" -type f 2>/dev/null || true)

    if [ -z "$log_files" ]; then
        print_warning "No log files found in $log_dir for $service"
        return
    fi

    # Collect logs from each file
    for log_file in $log_files; do
        if [ -f "$log_file" ] && [ -s "$log_file" ]; then
            local filename=$(basename "$log_file")
            {
                echo "=== FILE LOGS: $service/$filename ==="
                # Only collect new lines since last collection
                local since_file="$AGGREGATED_LOG_DIR/.${service}_${filename}_last_pos"
                local last_pos=0

                if [ -f "$since_file" ]; then
                    last_pos=$(cat "$since_file")
                fi

                local current_size=$(wc -c < "$log_file")
                if [ "$current_size" -gt "$last_pos" ]; then
                    tail -c +$((last_pos + 1)) "$log_file" | while IFS= read -r line; do
                        echo "$(date -Iseconds) [FILE] [$service] $line"
                    done
                    echo "$current_size" > "$since_file"
                fi
                echo "=== END FILE LOGS: $service/$filename ==="
                echo
            } >> "$AGGREGATED_LOG_FILE"
        fi
    done

    print_success "Collected file logs for $service"
}

# Function to generate log summary
generate_summary() {
    print_status "Generating log summary..."

    local summary_file="$AGGREGATED_LOG_DIR/log_summary.txt"
    local now=$(date)
    local total_lines=$(wc -l < "$AGGREGATED_LOG_FILE" 2>/dev/null || echo "0")
    local error_count=$(grep -c "\[ERROR\]" "$AGGREGATED_LOG_FILE" 2>/dev/null || echo "0")
    local warn_count=$(grep -c "\[WARN\]" "$AGGREGATED_LOG_FILE" 2>/dev/null || echo "0")

    {
        echo "MCP Services Log Summary"
        echo "Generated: $now"
        echo "Total log lines: $total_lines"
        echo "Error count: $error_count"
        echo "Warning count: $warn_count"
        echo
        echo "Service breakdown:"
    } > "$summary_file"

    for service in "${SERVICES[@]}"; do
        local service_errors=$(grep -c "\[ERROR\].*\[$service\]" "$AGGREGATED_LOG_FILE" 2>/dev/null || echo "0")
        local service_warns=$(grep -c "\[WARN\].*\[$service\]" "$AGGREGATED_LOG_FILE" 2>/dev/null || echo "0")
        local service_lines=$(grep -c "\[$service\]" "$AGGREGATED_LOG_FILE" 2>/dev/null || echo "0")

        echo "  $service: $service_lines lines, $service_errors errors, $service_warns warnings" >> "$summary_file"
    done

    print_success "Log summary saved to: $summary_file"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -c, --continuous    Run continuous log aggregation"
    echo "  -i, --interval SEC  Aggregation interval in seconds (default: 300)"
    echo "  -s, --summary       Generate log summary only"
    echo "  -r, --rotate        Force log rotation"
    echo "  -l, --cleanup       Run log cleanup only"
    echo
    echo "Environment Variables:"
    echo "  MAX_LOG_SIZE        Maximum log file size before rotation (default: 100M)"
    echo "  RETENTION_DAYS      Days to retain old logs (default: 7)"
}

# Parse command line arguments
CONTINUOUS=false
INTERVAL=300
SUMMARY_ONLY=false
ROTATE_ONLY=false
CLEANUP_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -c|--continuous)
            CONTINUOUS=true
            shift
            ;;
        -i|--interval)
            INTERVAL="$2"
            shift 2
            ;;
        -s|--summary)
            SUMMARY_ONLY=true
            shift
            ;;
        -r|--rotate)
            ROTATE_ONLY=true
            shift
            ;;
        -l|--cleanup)
            CLEANUP_ONLY=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Function to perform aggregation
perform_aggregation() {
    ensure_log_directory

    if [ "$ROTATE_ONLY" = true ]; then
        rotate_logs_if_needed
        return
    fi

    if [ "$CLEANUP_ONLY" = true ]; then
        cleanup_old_logs
        return
    fi

    if [ "$SUMMARY_ONLY" = true ]; then
        generate_summary
        return
    fi

    print_status "Starting log aggregation..."

    # Rotate logs if needed
    rotate_logs_if_needed

    # Collect logs from all services
    for i in "${!SERVICES[@]}"; do
        collect_docker_logs "${SERVICES[$i]}"
        collect_file_logs "${SERVICES[$i]}" "${LOG_DIRS[$i]}"
    done

    # Generate summary
    generate_summary

    print_success "Log aggregation completed"
}

# Main execution
if [ "$CONTINUOUS" = true ]; then
    print_status "Starting continuous log aggregation (interval: ${INTERVAL}s)"
    print_status "Press Ctrl+C to stop"

    while true; do
        perform_aggregation
        sleep "$INTERVAL"
    done
else
    perform_aggregation
fi