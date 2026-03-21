#!/bin/bash

# MCP Docker Infrastructure Setup Script
# This script automates the deployment of MCP servers using Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.mcp.yml"
PROJECT_NAME="mcp-infrastructure"
SERVICES=("mcp-weather" "mcp-filesystem" "mcp-git")
HEALTH_PORTS=("3000" "3001" "3002")

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running or not accessible. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
        print_error "docker-compose is not installed or not in PATH"
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."

    # Create data and log directories
    mkdir -p ../../mcp-data/weather
    mkdir -p ../../mcp-data/filesystem
    mkdir -p ../../mcp-data/git
    mkdir -p ../../mcp-logs/weather
    mkdir -p ../../mcp-logs/filesystem
    mkdir -p ../../mcp-logs/git

    print_success "Directories created"
}

# Function to check environment variables
check_environment() {
    print_status "Checking environment variables..."

    if [ -z "$OPENWEATHER_API_KEY" ]; then
        print_warning "OPENWEATHER_API_KEY is not set. Weather MCP server may not function properly."
    else
        print_success "OPENWEATHER_API_KEY is set"
    fi
}

# Function to wait for service health
wait_for_health() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $service to be healthy (port $port)..."

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "http://localhost:$port/health" >/dev/null 2>&1; then
            print_success "$service is healthy"
            return 0
        fi

        print_status "Attempt $attempt/$max_attempts: $service not ready yet..."
        sleep 5
        ((attempt++))
    done

    print_error "$service failed to become healthy within $(($max_attempts * 5)) seconds"
    return 1
}

# Function to deploy services
deploy_services() {
    print_status "Building and starting MCP services..."

    # Use docker compose (new syntax) if available, fallback to docker-compose
    if docker compose version >/dev/null 2>&1; then
        docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d --build
    else
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d --build
    fi

    if [ $? -eq 0 ]; then
        print_success "Services started successfully"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."

    # Check if containers are running
    for service in "${SERVICES[@]}"; do
        if docker ps --filter "name=${PROJECT_NAME}-${service}" --filter "status=running" | grep -q "$service"; then
            print_success "$service container is running"
        else
            print_error "$service container is not running"
            return 1
        fi
    done

    # Wait for health checks
    for i in "${!SERVICES[@]}"; do
        service="${SERVICES[$i]}"
        port="${HEALTH_PORTS[$i]}"
        wait_for_health "$service" "$port"
    done

    print_success "All services are healthy and ready"
}

# Main execution
main() {
    print_status "Starting MCP Docker Infrastructure Setup"

    # Pre-deployment checks
    check_docker
    check_docker_compose
    create_directories
    check_environment

    # Deploy services
    deploy_services

    # Verify deployment
    verify_deployment

    print_success "MCP Docker Infrastructure setup completed successfully!"
    print_status "Services available at:"
    echo "  - Weather MCP: http://localhost:3000"
    echo "  - Filesystem MCP: http://localhost:3001"
    echo "  - Git MCP: http://localhost:3002"
}

# Run main function
main "$@"