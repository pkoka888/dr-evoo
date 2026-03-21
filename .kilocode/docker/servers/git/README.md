# Git MCP Server

A Model Context Protocol (MCP) server that provides secure git repository operations.

## Features

- **Repository Operations**: Validate and work with git repositories
- **Commit History**: Retrieve commit history with filtering options
- **Branch Management**: List branches, create new branches, switch branches
- **Diff Generation**: Generate diffs between commits, branches, or working directory
- **Security Restrictions**: Path validation, operation restrictions, and access controls

## Security

The server implements several security measures:

- **Path Validation**: Only allows operations within configured allowed directories
- **Operation Restrictions**: Limits git operations to safe, read-only or controlled write operations
- **Repository Validation**: Ensures paths are valid git repositories
- **Input Sanitization**: Cleans and validates all user inputs

## Tools

### get_commit_history
Retrieves commit history from a git repository.

**Parameters:**
- `repoPath`: Path to the git repository
- `limit`: Maximum commits to retrieve (default: 50, max: 1000)
- `branch`: Branch name to get history from
- `since`: Only commits after this date (ISO format)
- `until`: Only commits before this date (ISO format)

### get_branches
Lists branches in a git repository.

**Parameters:**
- `repoPath`: Path to the git repository
- `all`: Include remote branches (default: false)

### get_diff
Generates diff between commits, branches, or working directory.

**Parameters:**
- `repoPath`: Path to the git repository
- `from`: Source commit/branch/tag
- `to`: Target commit/branch/tag
- `filePath`: Specific file to diff
- `cached`: Compare staged changes instead of working directory

### create_branch
Creates a new branch in a git repository.

**Parameters:**
- `repoPath`: Path to the git repository
- `branchName`: Name of the new branch
- `startPoint`: Starting point (default: current HEAD)

### switch_branch
Switches to a different branch.

**Parameters:**
- `repoPath`: Path to the git repository
- `branchName`: Name of the branch to switch to
- `create`: Create branch if it doesn't exist

## Docker Configuration

The server is containerized and configured in `docker-compose.mcp.yml`.

## MCP Configuration

To use this server, add the following to your MCP settings:

```json
{
  "mcpServers": {
    "git": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-git", "node", "dist/index.js"],
      "env": {}
    }
  }
}
```

Note: Ensure the `mcp-git` container is running before using the MCP server.

## Development

### Building
```bash
npm install
npm run build
```

### Running Locally
```bash
npm start
```

### Testing
```bash
npm test