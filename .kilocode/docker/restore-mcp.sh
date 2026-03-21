#!/bin/bash

# MCP Servers Restoration Script
# This script restores MCP server data, logs, and configurations from a backup

set -e  # Exit on any error

# Configuration
BACKUP_DIR="${MCP_BACKUP_DIR:-./backups}"
BACKUP_NAME="${1:-latest}"

if [ "$BACKUP_NAME" = "latest" ]; then
    # Find the most recent backup
    BACKUP_FILE=$(ls -t "${BACKUP_DIR}"/mcp_backup_*.tar.gz 2>/dev/null | head -1)
    if [ -z "$BACKUP_FILE" ]; then
        echo "Error: No backup files found in ${BACKUP_DIR}"
        exit 1
    fi
else
    BACKUP_FILE="${BACKUP_DIR}/mcp_backup_${BACKUP_NAME}.tar.gz"
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Starting MCP restoration from: $BACKUP_FILE"

# Stop MCP services before restoration
echo "Stopping MCP services..."
docker-compose -f .kilocode/docker/docker-compose.mcp.yml down || true

# Create backup of current state (optional safety measure)
CURRENT_BACKUP="${BACKUP_DIR}/pre_restore_$(date +"%Y%m%d_%H%M%S").tar.gz"
echo "Creating safety backup of current state..."
tar -czf "$CURRENT_BACKUP" \
    --exclude='secrets' \
    --exclude='backups' \
    --exclude='node_modules' \
    mcp-data/ \
    mcp-logs/ \
    .kilocode/docker/ \
    .env* \
    2>/dev/null || true

echo "Safety backup created: $CURRENT_BACKUP"

# Extract backup
echo "Extracting backup..."
tar -xzf "$BACKUP_FILE"

# Restore secrets if they were backed up separately (not in this script)
# Note: Secrets should be restored manually or from secure storage

echo "Restoration completed."

# Restart MCP services
echo "Starting MCP services..."
docker-compose -f .kilocode/docker/docker-compose.mcp.yml up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 30

# Check service health
echo "Checking service health..."
docker-compose -f .kilocode/docker/docker-compose.mcp.yml ps

echo "MCP restoration process completed successfully."
echo "Verify that all services are running and data is intact."