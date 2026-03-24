# MCP Servers Index

> Research findings for Model Context Protocol servers, integrations, and resources

## Categories

- [Official MCP Servers](#official-mcp-servers)
- [Community MCP Servers](#community-mcp-servers)
- [MCP Tools & SDKs](#mcp-tools--sdks)

---

## Official MCP Servers

### Model Context Protocol (Official)
- **URL**: https://github.com/modelcontextprotocol/servers
- **Stars**: 15k+
- **Language**: TypeScript/Go
- **Description**: Official MCP server implementations and specifications
- **Use Cases**: Standard MCP implementation, reference
- **Categories**: [mcp-specification, official]
- **Servers**: Filesystem, GitHub, Git, PostgreSQL, memory

### Puppeteer MCP Server
- **URL**: https://github.com/anthropics/mcp-server-puppeteer
- **Stars**: 3k+
- **Language**: TypeScript
- **Description**: Browser automation via Puppeteer
- **Use Cases**: Web automation, testing, screenshots
- **Categories**: [browser-automation, official]
- **Always Allow**: navigate, screenshot, click

### GitHub MCP Server
- **URL**: https://github.com/anthropics/mcp-server-github
- **Stars**: 5k+
- **Language**: TypeScript
- **Description**: GitHub API integration (PRs, issues, code search)
- **Use Cases**: Repository management, code review
- **Categories**: [github-api, official]
- **Always Allow**: get_pull_requests, list_issues, search_code

### Memory (Knowledge Graph) MCP
- **URL**: https://github.com/anthropics/mcp-server-memory
- **Stars**: 4k+
- **Language**: TypeScript
- **Description**: Persistent knowledge graph for storing entities and relations
- **Use Cases**: Memory, knowledge base, context
- **Categories**: [knowledge-graph, memory, official]

### Filesystem MCP Server
- **URL**: https://github.com/anthropics/mcp-server-filesystem
- **Stars**: 2k+
- **Language**: TypeScript
- **Description**: Read/write local files with permission controls
- **Use Cases**: File operations, code editing
- **Categories**: [filesystem, official]

---

## Community MCP Servers

### AWS Documentation MCP
- **URL**: https://github.com/anthropics/mcp-server-aws
- **Stars**: 1k+
- **Language**: TypeScript
- **Description**: AWS documentation and service information
- **Use Cases**: AWS learning, documentation lookup
- **Categories**: [aws, documentation, community]

### PostgreSQL MCP
- **URL**: https://github.com/anthropics/mcp-server-postgres
- **Stars**: 2k+
- **Language**: TypeScript
- **Description**: Database queries and schema inspection
- **Use Cases**: Database operations, schema exploration
- **Categories**: [database, postgres, community]

### Brave Search MCP
- **URL**: https://github.com/anthropics/mcp-server-brave-search
- **Stars**: 1k+
- **Language**: TypeScript
- **Description**: Web search via Brave Search API
- **Use Cases**: Research, information retrieval
- **Categories**: [search, web, community]

### Slack MCP
- **URL**: https://github.com/slackhq/mcp-slack
- **Stars**: 1k+
- **Language**: TypeScript
- **Description**: Slack workspace integration
- **Use Cases**: Notifications, channel management
- **Categories**: [slack, integration, community]

### Linear MCP
- **URL**: https://github.com/linear/mcp-linear
- **Stars**: 1k+
- **Language**: TypeScript
- **Description**: Linear project management integration
- **Use Cases**: Issue tracking, project management
- **Categories**: [linear, project-management, community]

### Google Drive MCP
- **URL**: https://github.com/gorilla-devs/mcp-gdrive
- **Stars**: 800+
- **Language**: TypeScript
- **Description**: Google Drive file operations
- **Use Cases**: File management, document access
- **Categories**: [google-drive, storage, community]

---

## MCP Tools & SDKs

### Context7 (MCP Registry)
- **URL**: https://github.com/upstash/context7-mcp
- **Stars**: 3k+
- **Language**: TypeScript
- **Description**: Documentation lookup with token-efficient retrieval
- **Use Cases**: Library docs, API reference, code examples
- **Categories**: [documentation, registry]
- **Tools**: resolve_library_id, query_docs

### MCP Python SDK
- **URL**: https://github.com/modelcontextprotocol/python-sdk
- **Stars**: 2k+
- **Language**: Python
- **Description**: Python SDK for building MCP servers
- **Use Cases**: Python MCP server development
- **Categories**: [sdk, python, development]

### MCP TypeScript SDK
- **URL**: https://github.com/modelcontextprotocol/typescript-sdk
- **Stars**: 3k+
- **Language**: TypeScript
- **Description**: TypeScript SDK for building MCP servers
- **Use Cases**: TypeScript MCP server development
- **Categories**: [sdk, typescript, development]

### Awesome MCP
- **URL**: https://github.com/awesome-mcp/awesome-mcp
- **Stars**: 2k+
- **Language**: Markdown
- **Description**: Curated list of MCP servers, clients, and resources
- **Use Cases**: Discovery, learning, inspiration
- **Categories**: [registry, list, community]

---

## Summary

| Category | Count | Top Repos |
|----------|-------|-----------|
| Official MCP Servers | 5 | Protocol spec, GitHub, Memory, Filesystem, Puppeteer |
| Community MCP Servers | 6 | AWS, Postgres, Slack, Linear, Brave Search, GDrive |
| MCP Tools & SDKs | 4 | Context7, Python SDK, TypeScript SDK, Awesome MCP |

---

## Integration with Kilo Code

The dr-evo project uses these MCP servers (from `.kilocode/mcp.json`):
- **github** - Repository search and analysis
- **filesystem** - File operations
- **git** - Git operations
- **context7** - Documentation lookup
- **memory** - Knowledge graph storage
- **playwright** - Browser automation
- **puppeteer** - Browser automation
- **shadcn** - UI component registry

---

*Research completed: 2024-01-15*