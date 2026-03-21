# MCP Servers Configuration and Secrets Management

This document explains how to configure environment variables and manage secrets for MCP (Model Context Protocol) servers in this project.

## Overview

MCP servers are configured using Docker Compose with secure credential handling. Sensitive information like API keys are managed through Docker secrets rather than environment variables in production.

## Environment Variables

Copy `.env.example` to `.env.local` and configure the following MCP-related variables:

```bash
# OpenWeather API Key for weather MCP server
OPENWEATHER_API_KEY=your_api_key_here

# MCP Server General Settings
MCP_NETWORK_SUBNET=172.20.0.0/16
MCP_HEALTH_CHECK_INTERVAL=30s
MCP_HEALTH_CHECK_TIMEOUT=10s
MCP_HEALTH_CHECK_RETRIES=3

# MCP Data and Log Directories (relative to project root)
MCP_DATA_DIR=mcp-data
MCP_LOGS_DIR=mcp-logs
```

## Docker Secrets Setup

### 1. Create Secrets Directory

The `secrets/` directory contains sensitive credential files. This directory should be:

- Added to `.gitignore`
- Have restricted permissions (600)
- Never committed to version control

### 2. Configure API Keys

For each MCP server requiring API keys:

1. Create a file in `secrets/` named after the secret (e.g., `openweather_api_key.txt`)
2. Put only the API key in the file (no extra whitespace or comments)
3. Set proper file permissions: `chmod 600 secrets/*.txt`

Example:
```bash
echo "your_actual_api_key_here" > secrets/openweather_api_key.txt
chmod 600 secrets/openweather_api_key.txt
```

### 3. Docker Compose Configuration

The `docker-compose.mcp.yml` file defines secrets and mounts them into containers:

```yaml
secrets:
  openweather_api_key:
    file: ../../secrets/openweather_api_key.txt

services:
  mcp-weather:
    secrets:
      - openweather_api_key
```

Secrets are mounted at `/run/secrets/{secret_name}` inside containers.

## Secure Credential Loading

MCP servers use a secure credential loading pattern:

1. **Production**: Load from Docker secrets (`/run/secrets/`)
2. **Development**: Fallback to environment variables
3. **Error Handling**: Clear error messages if credentials are missing

Example implementation in TypeScript:

```typescript
function loadApiKey(): string {
  // Try Docker secret first (production)
  const secretPath = "/run/secrets/openweather_api_key";
  if (fs.existsSync(secretPath)) {
    return fs.readFileSync(secretPath, "utf8").trim();
  }

  // Fallback to environment variable (development)
  const envKey = process.env.OPENWEATHER_API_KEY;
  if (envKey) {
    return envKey;
  }

  throw new Error("API key not found in secrets or environment variables");
}
```

## Deployment

### Development

For development, you can use environment variables directly:

```bash
export OPENWEATHER_API_KEY=your_key
docker-compose -f .kilocode/docker/docker-compose.mcp.yml up
```

### Production

For production, ensure secrets are properly configured:

```bash
# Verify secrets exist and have correct permissions
ls -la secrets/

# Start MCP services
docker-compose -f .kilocode/docker/docker-compose.mcp.yml up -d
```

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use Docker secrets** for production deployments
3. **Restrict file permissions** on secret files
4. **Rotate API keys** regularly
5. **Monitor access logs** for unauthorized usage
6. **Use environment-specific secrets** (dev/staging/prod)

## Troubleshooting

### Common Issues

1. **"API key not found" error**:
   - Check if secret file exists: `ls secrets/openweather_api_key.txt`
   - Verify file permissions: `ls -la secrets/`
   - Ensure Docker Compose can read the file

2. **Permission denied**:
   - Set correct permissions: `chmod 600 secrets/*.txt`
   - Check if running as correct user

3. **Container won't start**:
   - Verify Docker Compose file syntax
   - Check Docker logs: `docker-compose logs mcp-weather`

### Health Checks

All MCP services include health checks. Monitor them with:

```bash
docker-compose -f .kilocode/docker/docker-compose.mcp.yml ps
docker-compose -f .kilocode/docker/docker-compose.mcp.yml logs
```

## API Key Sources

- **OpenWeather**: https://openweathermap.org/api
- Register for a free API key and keep it secure

## Maintenance

- Regularly update API keys before expiration
- Audit secret file access logs
- Keep Docker and Docker Compose updated
- Monitor MCP service health and logs