# Graphiti MCP Server Integration

This directory contains the configuration for running the Graphiti MCP server with Neo4j as the graph database backend.

## Overview

Graphiti is a temporal knowledge graph service for AI agents that enables:
- Storing contextual information as richly connected knowledge networks
- Semantic search across stored information
- Entity and relationship tracking over time
- Persistent memory for agent workflows

## Prerequisites

- Docker and Docker Compose
- OpenAI API key (for LLM-based entity extraction and embeddings)
- At least 4GB RAM available for Neo4j

## Quick Start

### 1. Configure Environment

Copy the example environment file and update with your settings:

```bash
cd .kilocode/docker/servers/graphiti
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 2. Start the MCP Server

Start Neo4j and the Graphiti MCP server:

```bash
cd .kilocode/docker/servers/graphiti
docker-compose up -d
```

This will start:
- **Neo4j** on ports 7474 (HTTP) and 7687 (Bolt)
- **Graphiti MCP Server** on port 8000

### 3. Verify Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy", "service": "graphiti-mcp"}
```

### 4. Connect MCP Client

The Graphiti MCP server exposes tools via stdio, SSE, or HTTP transport. Connect your MCP client to:

```
http://localhost:8000/mcp/
```

## Available MCP Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `add_memory` | Store new information in the knowledge graph | `name`, `episode_body`, `group_id`, `source`, `source_description`, `uuid` |
| `search_nodes` | Search for entities using semantic search | `query`, `group_ids`, `max_nodes`, `entity_types` |
| `search_memory_facts` | Search for facts/relationships | `query`, `group_ids`, `max_facts`, `center_node_uuid` |
| `get_episodes` | Retrieve episodes from memory | `group_ids`, `max_episodes` |
| `get_entity_edge` | Get a specific entity edge by UUID | `uuid` |
| `delete_episode` | Delete an episode | `uuid` |
| `delete_entity_edge` | Delete an entity edge | `uuid` |
| `clear_graph` | Clear all data for specified groups | `group_ids` |
| `get_status` | Get server and database status | (none) |

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for entity extraction | (required) |
| `NEO4J_URI` | Neo4j Bolt connection URI | `bolt://localhost:7687` |
| `NEO4J_USER` | Neo4j username | `neo4j` |
| `NEO4J_PASSWORD` | Neo4j password | `graphiti_password` |
| `GRAPHITI_GROUP_ID` | Default group ID for organizing memories | `default` |
| `PORT` | Server port | `8000` |

### Configuration File

The server uses `config.yaml` for additional settings:

```yaml
llm:
  provider: openai
  model: gpt-4.1-mini
  temperature: 0.0

embedder:
  provider: openai
  model: text-embedding-3-small

database:
  provider: neo4j
  host: neo4j
  port: 7687
  user: neo4j
  password: graphiti_password

server:
  transport: http
  host: 0.0.0.0
  port: 8000
```

## Memory Mode

A dedicated memory mode configuration is available at `.kilocode/modes/memory/config.json` with operations:

- **store_context**: Store new information
- **retrieve_context**: Semantic search for context
- **entity_search**: Find specific entities
- **fact_search**: Search relationships
- **manage_episodes**: Get/delete episodes
- **clear_memory**: Clear graph data

## Usage Examples

### Adding Memory

```javascript
// Via MCP tool call
await mcp.graphiti.add_memory({
  name: "Project Requirements",
  episode_body: "The dashboard should support real-time data updates every 5 seconds",
  group_id: "project-1",
  source: "text"
});
```

### Searching Memory

```javascript
// Semantic search for relevant context
const results = await mcp.graphiti.search_nodes({
  query: "real-time dashboard updates",
  group_ids: ["project-1"],
  max_nodes: 5
});
```

### Searching Facts

```javascript
// Find relationships between entities
const facts = await mcp.graphiti.search_memory_facts({
  query: "what features are planned",
  max_facts: 10
});
```

## Stopping the Server

```bash
cd .kilocode/docker/servers/graphiti
docker-compose down
```

To also remove data volumes:
```bash
docker-compose down -v
```

## Troubleshooting

### Neo4j Connection Issues

If you see "Database Connection Error: Neo4j is not running":
1. Check that Neo4j container is running: `docker ps | grep neo4j`
2. Check logs: `docker-compose logs neo4j`
3. Verify Neo4j credentials match in both .env and config.yaml

### OpenAI API Errors

If you see rate limit or API key errors:
1. Verify OPENAI_API_KEY is set correctly in .env
2. Check the key has sufficient credits
3. Adjust SEMAPHORE_LIMIT in config (lower = slower but fewer rate limit errors)

### Search Returns No Results

1. Ensure memories have been added and processed (check logs for "Episode processing complete")
2. Try a broader search query
3. Verify group_ids match what was used when storing

## Additional Resources

- [Graphiti Documentation](https://github.com/getzep/graphiti)
- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
- [Neo4j Documentation](https://neo4j.com/docs/)
