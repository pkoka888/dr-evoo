# Filesystem MCP Server

A secure Model Context Protocol (MCP) server implementation in TypeScript that provides safe filesystem operations with comprehensive security restrictions.

## Features

- **File Operations**: Read files with size limits and security validation
- **Directory Navigation**: List directory contents with filtering options
- **Metadata Retrieval**: Get file and directory metadata (size, permissions, timestamps)
- **File Search**: Search for files and directories by pattern
- **Security First**: Path traversal protection, configurable restrictions, input validation
- **Docker Containerized**: Secure container with non-root user execution
- **Health Monitoring**: HTTP health check endpoint for container monitoring

## Security Features

- Path traversal attack prevention
- Configurable allowed root directories
- File size limits (default: 10MB)
- File type restrictions
- Input sanitization and validation
- Non-root user execution in containers
- Read-only workspace access

## Tools

### read_file
Reads the contents of a file with security restrictions.

**Parameters:**
- `path` (string): Path to the file to read

**Security:** Validates path, checks file size limits, ensures file exists and is readable.

### list_directory
Lists contents of a directory with optional filtering.

**Parameters:**
- `path` (string): Path to the directory to list
- `pattern` (string, optional): Glob pattern to filter results

**Security:** Validates directory path, ensures directory exists and is readable.

### get_file_metadata
Retrieves metadata information for files and directories.

**Parameters:**
- `path` (string): Path to the file or directory

**Returns:** Size, type, permissions, timestamps, and other metadata.

### search_files
Searches for files and directories by name pattern.

**Parameters:**
- `directory` (string): Root directory to search in
- `pattern` (string): Search pattern (supports * and ? wildcards)
- `maxResults` (number, optional): Maximum results to return (default: 100)

## Configuration

### Environment Variables
- `WORKSPACE_PATH`: Path to the workspace directory (default: `/app/workspace`)
- `HEALTH_PORT`: Port for health check server (default: `3001`)
- `NODE_ENV`: Environment mode

### Security Configuration
The server uses a default security configuration that can be customized:

```typescript
const config: SecurityConfig = {
  allowedRootDirectories: ['/app/workspace'],
  maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedFileExtensions: ['.txt', '.md', '.json', '.js', '.ts', '.py', '.html', '.css'],
  blockedPaths: ['/etc', '/proc', '/sys', '/dev', '/root', '/home']
};
```

## Docker Deployment

### Build
```bash
docker build -t mcp-filesystem-server .
```

### Run
```bash
docker run -p 3001:3001 \
  -v /host/workspace:/app/workspace:ro \
  -v /host/data:/app/data \
  -v /host/logs:/app/logs \
  mcp-filesystem-server
```

### Docker Compose
The server is configured in `.kilocode/docker/docker-compose.mcp.yml` for integration with the MCP Docker setup.

## Development

### Setup
```bash
npm install
```

### Build
```bash
npm run build
```

### Run
```bash
npm start
```

### Test
```bash
npm test
```

### Development with watch
```bash
npm run dev
```

## Health Check

The server provides an HTTP health check endpoint at `http://localhost:3001/health` that returns:

```json
{
  "status": "healthy",
  "timestamp": "2026-01-20T12:00:00.000Z",
  "service": "filesystem-mcp-server"
}
```

## Error Handling

The server implements comprehensive error handling with custom security errors:

- `SecurityError`: Thrown for security violations
- Generic errors for filesystem operations
- Structured logging for debugging

## Architecture

- **Modular Design**: Separate tools, utilities, and security modules
- **Type Safety**: Full TypeScript implementation with strict typing
- **MCP Compliance**: Uses official MCP SDK for protocol compliance
- **Async/Await**: Modern JavaScript async patterns
- **Error Boundaries**: Graceful error handling and recovery

## Integration

This server integrates with Kilo Code's MCP infrastructure and can be configured in `.kilocode/mcp.json` for local development or deployed via Docker Compose for production use.

## License

MIT