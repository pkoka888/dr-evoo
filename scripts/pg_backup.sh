#!/bin/sh
# PostgreSQL backup script for docker-compose pg-backup service
# Creates daily SQL dumps stored in /backups volume

set -e

BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S).sql"
BACKUP_PATH="/backups/${BACKUP_NAME}"

echo "Starting PostgreSQL backup..."

# Run pg_dump and save to backup path
pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "$BACKUP_PATH"

# Get file size for logging
SIZE=$(du -h "$BACKUP_PATH" | cut -f1)

echo "Backup completed: $BACKUP_NAME ($SIZE)"

# Optional: Clean up old backups (keep last 7 days)
find /backups -name "backup_*.sql" -mtime +7 -delete

echo "Old backups cleaned up (kept last 7 days)"
