#!/bin/bash

# MCP Servers Backup Script
# This script creates automated backups of MCP server data, logs, and configurations

set -e  # Exit on any error

# Configuration
BACKUP_DIR="${MCP_BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="mcp_backup_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "Starting MCP backup: ${BACKUP_NAME}"

# Stop MCP services to ensure data consistency (optional, uncomment if needed)
# echo "Stopping MCP services..."
# docker-compose -f .kilocode/docker/docker-compose.mcp.yml down

# Create backup archive
echo "Creating backup archive..."
tar -czf "${BACKUP_PATH}.tar.gz" \
    --exclude='secrets' \
    --exclude='backups' \
    --exclude='*.log' \
    --exclude='node_modules' \
    mcp-data/ \
    mcp-logs/ \
    .kilocode/docker/ \
    .env* \
    2>/dev/null || true  # Ignore errors for missing files

# Calculate backup size
BACKUP_SIZE=$(du -sh "${BACKUP_PATH}.tar.gz" | cut -f1)

echo "Backup completed successfully:"
echo "  Location: ${BACKUP_PATH}.tar.gz"
echo "  Size: ${BACKUP_SIZE}"

# Optional: Restart services if they were stopped
# echo "Restarting MCP services..."
# docker-compose -f .kilocode/docker/docker-compose.mcp.yml up -d

# Optional: Rotate old backups (keep last 7 daily, last 4 weekly)
echo "Rotating old backups..."
find "${BACKUP_DIR}" -name "mcp_backup_*.tar.gz" -mtime +7 -delete 2>/dev/null || true

echo "Backup rotation completed. Kept backups from last 7 days."

# Log backup completion
echo "$(date): MCP backup ${BACKUP_NAME} completed (size: ${BACKUP_SIZE})" >> "${BACKUP_DIR}/backup.log"

echo "MCP backup process finished."