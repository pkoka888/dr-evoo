# GitHub Research Skill

> Skill for systematically searching and analyzing GitHub repositories

## Overview

This skill provides capabilities for searching GitHub repositories, analyzing their content, and organizing findings for research purposes. It integrates with MCP GitHub server for search operations.

## Capabilities

### Repository Search
- Search by keywords, topics, and language
- Filter by stars, forks, last update
- Sort by relevance, stars, forks
- Paginate through results

### Code Search
- Search code across repositories
- Find specific patterns or implementations
- Filter by language and file extension

### Issue Search
- Find issues and pull requests
- Filter by state (open, closed)
- Search by labels and keywords

### Repository Analysis
- Fetch README and metadata
- Analyze file structure
- Review commit history
- Extract dependencies

## MCP Server Requirements

This skill uses the following MCP servers:

| Server | Tools Used |
|--------|-----------|
| github | search_repositories, search_code, get_file_contents |
| context7 | resolve_library_id, query_docs |
| memory | create_entities, search_nodes |

## Usage

### Search Repositories

```typescript
// Example: Search for agent frameworks
const results = await mcp__github__search_repositories({
  query: "ai-agent-template stars:>50",
  perPage: 30,
  sort: "stars"
})
```

### Search Code

```typescript
// Example: Search for specific patterns
const codeResults = await mcp__github__search_code({
  q: "agent scaffold language:typescript",
  perPage: 20
})
```

### Fetch Repository Contents

```typescript
// Example: Get README
const readme = await mcp__github__get_file_contents({
  owner: "owner",
  repo: "repository",
  path: "README.md"
})
```

## Search Strategies

### Agent Frameworks
- Primary keywords: `ai-agent`, `claude-agent`, `agent-scaffold`
- Topics: `ai-agents`, `autonomous-agents`, `multi-agent`
- Min stars: 50

### Skills & Knowledge
- Primary keywords: `prompt-library`, `capability-module`
- Topics: `prompt-engineering`, `ai-skills`
- Min stars: 30

### MCP Servers
- Primary keywords: `mcp-server`, `model-context-protocol`
- Topics: `mcp`, `model-context-protocol`
- Min stars: 20

### Workflows
- Primary keywords: `github-actions`, `workflow-template`
- Topics: `automation`, `ci-cd`
- Min stars: 30

## Best Practices

1. **Filter early** - Apply star filters in search query
2. **Limit results** - Cap at 30-50 per category to manage volume
3. **Prioritize README** - Fetch README first for quick assessment
4. **Store in memory** - Use memory MCP for retrieval
5. **Categorize early** - Tag during research, not after

## Integration

This skill is used by the `repository-researcher` agent and `/research` workflow. It provides the core search and analysis capabilities needed for building the knowledge base index.

---

*This skill enables systematic GitHub research with MCP server integration.*
