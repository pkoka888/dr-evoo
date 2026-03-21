# MCP Servers Backup and Recovery Procedures

This document provides instructions for using the automated backup and recovery scripts for MCP servers.

## Automated Backup

### Daily Backup Schedule

Set up a cron job or scheduled task to run the backup script daily:

```bash
# Example cron job (run at 2 AM daily)
0 2 * * * cd /path/to/project && ./.kilocode/docker/backup-mcp.sh
```

### Manual Backup

Run the backup script manually:

```bash
./.kilocode/docker/backup-mcp.sh
```

### Backup Configuration

- **Backup Directory**: `./backups/` (configurable via `MCP_BACKUP_DIR` environment variable)
- **Retention**: Keeps backups for 7 days, automatically deletes older ones
- **Content**: MCP data, logs, Docker configurations, environment files
- **Exclusions**: Secrets directory, node_modules, log files during backup

## Recovery Procedures

### Automated Recovery

To restore from the latest backup:

```bash
./.kilocode/docker/restore-mcp.sh
```

To restore from a specific backup:

```bash
./.kilocode/docker/restore-mcp.sh 20231201_020000
```

### Manual Recovery Steps

1. **Stop Services**: Ensure MCP services are stopped
2. **Extract Backup**: Manually extract the backup archive
3. **Restore Secrets**: Copy secrets from secure storage
4. **Start Services**: Restart MCP services
5. **Verify**: Check service health and data integrity

## Backup Verification

### Check Backup Integrity

```bash
# List available backups
ls -la backups/

# Verify backup contents
tar -tzf backups/mcp_backup_20231201_020000.tar.gz | head -20

# Check backup size
du -sh backups/mcp_backup_*.tar.gz
```

### Test Restoration

Perform regular restoration tests:

1. Create a test environment
2. Run restoration script
3. Verify all services start correctly
4. Check data integrity
5. Clean up test environment

## Security Considerations

- Backups exclude sensitive secrets directory
- Store backups in secure locations
- Encrypt backups containing sensitive data
- Regularly rotate backup encryption keys

## Monitoring

### Backup Success Monitoring

- Check backup logs: `tail -f backups/backup.log`
- Monitor backup directory size
- Set up alerts for backup failures

### Recovery Testing

- Monthly recovery drills
- Document recovery times
- Update procedures based on test results

## Troubleshooting

### Common Issues

1. **Backup fails with permission errors**
   - Ensure script has execute permissions
   - Check directory permissions for backup location

2. **Restoration fails**
   - Verify backup file integrity
   - Check available disk space
   - Ensure Docker services can start

3. **Services don't start after recovery**
   - Check Docker logs
   - Verify network configuration
   - Confirm secrets are properly restored

### Logs and Debugging

- Backup script logs to `backups/backup.log`
- Docker service logs: `docker-compose -f .kilocode/docker/docker-compose.mcp.yml logs`
- System logs for additional debugging

## Maintenance

- Review backup retention policies quarterly
- Update backup scripts with configuration changes
- Test backup and recovery procedures after major updates
- Monitor backup storage usage