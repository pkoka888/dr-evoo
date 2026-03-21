# MCP Servers Disaster Recovery Plan

## Overview

This document outlines the disaster recovery procedures for MCP (Model Context Protocol) servers in the dash.okamih.cz project. The plan ensures minimal downtime and data loss in case of system failures, data corruption, or catastrophic events.

## Recovery Objectives

- **RTO (Recovery Time Objective)**: 2-4 hours for full service restoration
- **RPO (Recovery Point Objective)**: Maximum 24 hours of data loss (based on backup frequency)
- **Data Integrity**: Ensure all MCP server data and configurations are recoverable

## Components to Recover

1. **MCP Server Data**: Stored in `mcp-data/` directory
2. **MCP Server Logs**: Stored in `mcp-logs/` directory
3. **Configurations**: Docker Compose files, environment variables, Dockerfiles
4. **Secrets**: API keys and sensitive credentials (handled separately)

## Disaster Scenarios

### Scenario 1: Single MCP Service Failure

**Detection**: Health check failures, service logs indicate errors

**Recovery Steps**:
1. Check service logs: `docker-compose -f .kilocode/docker/docker-compose.mcp.yml logs <service_name>`
2. Restart failed service: `docker-compose -f .kilocode/docker/docker-compose.mcp.yml restart <service_name>`
3. If restart fails, rebuild service: `docker-compose -f .kilocode/docker/docker-compose.mcp.yml up --build <service_name>`

### Scenario 2: Complete MCP Stack Failure

**Detection**: All MCP services down, health checks failing

**Recovery Steps**:
1. Stop all services: `docker-compose -f .kilocode/docker/docker-compose.mcp.yml down`
2. Check system resources (disk space, memory)
3. Rebuild and restart all services: `docker-compose -f .kilocode/docker/docker-compose.mcp.yml up --build -d`
4. Monitor service health: `docker-compose -f .kilocode/docker/docker-compose.mcp.yml ps`

### Scenario 3: Data Corruption or Loss

**Detection**: Inconsistent data, missing files, service errors

**Recovery Steps**:
1. Stop all MCP services
2. Identify corrupted components
3. Restore from backup using restoration script: `./.kilocode/docker/restore-mcp.sh <backup_timestamp>`
4. Verify data integrity
5. Restart services

### Scenario 4: Host System Failure

**Detection**: Server unreachable, hardware failure

**Recovery Steps**:
1. Provision new host system with same specifications
2. Install Docker and Docker Compose
3. Clone project repository
4. Restore secrets directory from secure backup
5. Run restoration script: `./.kilocode/docker/restore-mcp.sh`
6. Start MCP services
7. Update DNS/load balancer configurations

### Scenario 5: Catastrophic Data Center Failure

**Detection**: Entire infrastructure down

**Recovery Steps**:
1. Activate secondary data center or cloud failover
2. Follow "Host System Failure" recovery steps
3. Restore from offsite backups
4. Update global DNS configurations
5. Notify stakeholders of recovery progress

## Backup Strategy

### Automated Backups
- **Frequency**: Daily at 02:00 UTC
- **Retention**: 7 days for daily backups
- **Location**: Local `./backups/` directory
- **Content**: MCP data, logs, configurations (excludes secrets)

### Manual Backups
- Before major updates or migrations
- Before configuration changes
- On-demand for critical operations

### Offsite Backup
- Weekly backups uploaded to secure cloud storage
- Encrypted backups for sensitive data
- Test restoration from offsite backups quarterly

## Restoration Procedures

### Automated Restoration
Use the provided restoration script:
```bash
./.kilocode/docker/restore-mcp.sh [backup_timestamp]
```

### Manual Restoration Steps
1. Stop MCP services
2. Extract backup archive
3. Restore secrets (manual process)
4. Start MCP services
5. Verify functionality

## Testing and Validation

### Regular Testing
- Monthly disaster recovery drills
- Backup integrity verification
- Restoration time measurement

### Validation Checklist
- [ ] All MCP services healthy
- [ ] Data integrity verified
- [ ] API endpoints responding
- [ ] Logs accessible
- [ ] Secrets properly loaded

## Communication Plan

### During Incident
- Notify development team immediately
- Update status in incident tracking system
- Communicate with stakeholders if RTO exceeded

### Post-Recovery
- Document incident and recovery process
- Update recovery procedures if needed
- Conduct post-mortem analysis

## Maintenance

- Review and update this plan quarterly
- Test backup and recovery procedures monthly
- Update contact information and responsibilities
- Monitor backup success/failure notifications

## Contacts

- **Primary Contact**: System Administrator
- **Secondary Contact**: DevOps Team Lead
- **Escalation**: Project Manager

## Appendices

- Backup script: `.kilocode/docker/backup-mcp.sh`
- Restoration script: `.kilocode/docker/restore-mcp.sh`
- Service health check commands
- Backup verification procedures