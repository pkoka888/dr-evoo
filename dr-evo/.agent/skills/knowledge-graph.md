# Knowledge Graph Skill

> Skill for storing and retrieving research findings in memory

## Overview

This skill provides capabilities for storing research findings in a knowledge graph, enabling retrieval and organization of discovered repositories and their relationships.

## Capabilities

### Entity Management
- Create entities for repositories
- Add observations (metadata, use cases, notes)
- Create relations between entities
- Delete and update entities

### Query Operations
- Search nodes by query
- Read entire knowledge graph
- Open specific entities by name
- Find related entities

## MCP Server Requirements

This skill requires the `memory` MCP server.

| Server | Tools Used |
|--------|-----------|
| memory | create_entities, create_relations, search_nodes, read_graph, open_nodes |

## Usage

### Create Repository Entity

```typescript
// Example: Store a repository as an entity
await mcp__memory__create_entities({
  entities: [{
    name: "ai-agent-template",
    entityType: "repository",
    observations: [
      "URL: https://github.com/owner/ai-agent-template",
      "Stars: 1200",
      "Language: TypeScript",
      "Use Cases: Agent scaffolding, multi-agent systems",
      "Categories: [agent, template]"
    ]
  }]
})
```

### Create Relationships

```typescript
// Example: Link repository to category
await mcp__memory__create_relations({
  relations: [{
    from: "ai-agent-template",
    relationType: "belongs_to",
    to: "agent-frameworks"
  }]
})
```

### Search for Entities

```typescript
// Example: Find all agent-related repositories
const results = await mcp__memory__search_nodes({
  query: "agent template"
})
```

### Read Graph

```typescript
// Example: Get all stored research
const graph = await mcp__memory__read_graph({})
```

## Entity Schema

### Repository Entity
```typescript
{
  name: string,           // Repository name (unique ID)
  entityType: "repository",
  observations: [
    "URL: ...",
    "Stars: ...",
    "Language: ...",
    "Description: ...",
    "Use Cases: ...",
    "Categories: [...]",
    "Added: YYYY-MM-DD"
  ]
}
```

### Category Entity
```typescript
{
  name: string,           // Category name (unique ID)
  entityType: "category",
  observations: [
    "Type: agent|skill|rule|workflow|mcp|knowledge-base",
    "Count: N",
    "Last Updated: YYYY-MM-DD"
  ]
}
```

## Best Practices

1. **Unique names** - Use repo name as entity ID to avoid duplicates
2. **Consistent observations** - Follow schema for easy querying
3. **Create relations** - Link repos to categories for navigation
4. **Query-friendly** - Use searchable terms in observations
5. **Update regularly** - Keep metadata current

## Integration

This skill is used by the `repository-researcher` agent to store findings and by the `index-curator` agent to retrieve and organize them into markdown indexes.

---

*This skill enables persistent knowledge storage for research findings.*
