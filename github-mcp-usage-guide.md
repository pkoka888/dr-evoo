# GitHub MCP Server Usage Guide

This guide demonstrates how to use the GitHub MCP server with Kilo Code to perform GitHub operations directly from your IDE.

## Prerequisites

✅ **GitHub MCP Server Configured**: The GitHub MCP server is properly configured in `.kilocode/mcp.json`
✅ **GITHUB_TOKEN Set**: The `GITHUB_TOKEN` environment variable is set and valid
✅ **Auto-Approval Enabled**: The GitHub MCP server tools are configured for auto-approval

## Available GitHub MCP Tools

The GitHub MCP server provides the following tools:

### 1. `search_code`
Search for code patterns across the repository
- **Purpose**: Find specific code patterns, functions, or text across all files
- **Use Cases**: 
  - Finding TODO comments
  - Locating specific functions or classes
  - Searching for error messages or keywords
  - Code refactoring preparation

### 2. `get_commits`
Get commit history and details
- **Purpose**: Retrieve commit information, messages, and changes
- **Use Cases**:
  - Reviewing recent changes
  - Understanding commit history
  - Finding when specific changes were made
  - Preparing release notes

### 3. `list_branches`
List all branches in the repository
- **Purpose**: Get information about all branches
- **Use Cases**:
  - Understanding project structure
  - Finding feature branches
  - Checking branch status
  - Planning merges

### 4. `get_branch`
Get information about a specific branch
- **Purpose**: Get details about a specific branch
- **Use Cases**:
  - Checking branch status
  - Finding latest commit on a branch
  - Understanding branch relationships

### 5. `get_pull_requests`
Get information about pull requests
- **Purpose**: Retrieve PR details, status, and comments
- **Use Cases**:
  - Reviewing open PRs
  - Checking PR status
  - Understanding code review progress
  - Finding related discussions

### 6. `get_issues`
Get information about issues
- **Purpose**: Retrieve issue details, status, and comments
- **Use Cases**:
  - Reviewing open issues
  - Understanding bug reports
  - Checking issue status
  - Finding feature requests

## How to Use GitHub MCP Tools

### Method 1: Direct Tool Usage (Recommended)

Ask Kilo Code to use specific GitHub MCP tools:

```
Use the GitHub MCP server to [action] [parameters]
```

**Examples:**

1. **Search for TODO comments:**
   ```
   Use the GitHub MCP server to search for files containing "TODO" in the src/ directory
   ```

2. **Get recent commits:**
   ```
   Use the GitHub MCP server to get the latest 10 commits from the main branch
   ```

3. **List all branches:**
   ```
   Use the GitHub MCP server to list all branches in this repository
   ```

4. **Get branch information:**
   ```
   Use the GitHub MCP server to get information about the feature/new-ui branch
   ```

5. **Search for specific code patterns:**
   ```
   Use the GitHub MCP server to search for all functions that contain "validate" in their name
   ```

6. **Get pull request information:**
   ```
   Use the GitHub MCP server to get all open pull requests
   ```

7. **Search for error handling:**
   ```
   Use the GitHub MCP server to search for files containing "try-catch" or "error handling"
   ```

### Method 2: Contextual Requests

Ask Kilo Code to perform tasks that would benefit from GitHub information:

```
I need to [task] - please use the GitHub MCP server to help with this
```

**Examples:**

1. **Understanding codebase structure:**
   ```
   I need to understand the structure of this codebase. Please use the GitHub MCP server to search for the main entry points and key modules.
   ```

2. **Finding recent changes:**
   ```
   I need to understand what has changed recently. Please use the GitHub MCP server to get the latest commits and identify any breaking changes.
   ```

3. **Code review preparation:**
   ```
   I need to review the recent changes before merging. Please use the GitHub MCP server to get the latest commits and any related pull requests.
   ```

4. **Bug investigation:**
   ```
   I'm investigating a bug related to authentication. Please use the GitHub MCP server to search for recent changes to authentication-related files.
   ```

## Example Workflows

### Workflow 1: Codebase Exploration

```
Task: "I need to understand this codebase structure"

1. Use the GitHub MCP server to list all branches
2. Use the GitHub MCP server to search for main entry points (e.g., "main", "app", "index")
3. Use the GitHub MCP server to search for key modules or components
4. Use the GitHub MCP server to get recent commits to understand active development areas
```

### Workflow 2: Bug Investigation

```
Task: "I need to investigate a performance issue"

1. Use the GitHub MCP server to search for recent changes to performance-critical files
2. Use the GitHub MCP server to search for TODO comments related to performance
3. Use the GitHub MCP server to get recent commits that might have introduced the issue
4. Use the GitHub MCP server to search for any open issues related to performance
```

### Workflow 3: Feature Development

```
Task: "I need to implement a new feature"

1. Use the GitHub MCP server to search for similar existing features
2. Use the GitHub MCP server to search for relevant code patterns or utilities
3. Use the GitHub MCP server to get recent commits to understand current development patterns
4. Use the GitHub MCP server to search for any related issues or discussions
```

## Best Practices

### 1. Be Specific
- Use specific search terms and file patterns
- Specify branches when relevant
- Use appropriate result limits

### 2. Combine Tools
- Use multiple tools together for comprehensive analysis
- Start with broad searches, then narrow down
- Use commit information to understand context

### 3. Understand Limitations
- GitHub MCP tools work with the current repository
- Search results are limited by GitHub's API rate limits
- Some operations may take time for large repositories

### 4. Use Auto-Approval
- The GitHub MCP server is configured for auto-approval
- This means Kilo Code can use these tools without manual approval
- This enables seamless integration into workflows

## Troubleshooting

### Common Issues

1. **"GitHub MCP server not found"**
   - Check that `.kilocode/mcp.json` exists and is properly configured
   - Verify that the GitHub MCP server is enabled (not disabled)

2. **"Authentication failed"**
   - Check that `GITHUB_TOKEN` environment variable is set
   - Verify that the token has the necessary permissions

3. **"Tool not found"**
   - Check that the tool name is correct
   - Verify that the tool is available in the current MCP server

4. **"Rate limit exceeded"**
   - Wait a few minutes and try again
   - Consider reducing the scope of your search

### Getting Help

If you encounter issues:
1. Run the test script: `node test-github-mcp.js`
2. Check the Kilo Code logs for detailed error messages
3. Verify your GitHub token permissions
4. Ensure you're working in the correct repository

## Next Steps

Now that the GitHub MCP server is configured and ready:

1. **Start a new task** in Kilo Code
2. **Ask Kilo Code** to use GitHub MCP tools for your specific needs
3. **Experiment** with different search patterns and queries
4. **Combine** GitHub MCP tools with other Kilo Code capabilities

The GitHub MCP server provides powerful integration with your GitHub repository, enabling seamless code exploration, issue tracking, and development workflow enhancement directly from your IDE.