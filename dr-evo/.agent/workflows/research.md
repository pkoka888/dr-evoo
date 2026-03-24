# /research Workflow

> Slash command workflow for GitHub repository research

## Purpose

Execute comprehensive research on GitHub repositories to build an index of useful sources for AI agents, skills, rules, workflows, MCP servers, and knowledge base.

## Trigger

```
/research [category]
/research all
/research agents
/research skills
/research mcp
```

## Prerequisites

This workflow requires the following MCP servers configured:
- `github` - For searching repositories
- `filesystem` - For reading/writing files
- `git` - For analyzing repositories
- `context7` - For documentation lookup
- `memory` - For storing research findings

## Steps

### Step 1: Parse Category
- Parse the category argument
- Default to "all" if not provided
- Map category to search keywords

### Step 2: Execute Search
- Use GitHub MCP to search repositories
- Filter by stars (min 20-50 depending on category)
- Sort by stars descending
- Limit to top 30-50 results per category

### Step 3: Fetch Details
- For each repository:
  - Fetch README content
  - Get metadata (stars, language, description)
  - Query Context7 for documentation if applicable
  - Analyze file structure if needed

### Step 4: Store Findings
- Create entities in memory for each repo
- Add relationships to categories
- Store key metadata for retrieval

### Step 5: Generate Index
- Write category-specific markdown files
- Create main index with navigation
- Generate quick reference summaries

### Step 6: Report
- Summarize findings
- List new additions
- Provide next steps

## Categories & Keywords

| Category | Keywords | Min Stars |
|----------|----------|-----------|
| agents | ai-agent, claude-agent, agent-template, multi-agent | 50 |
| skills | ai-skill, prompt-library, capability-module | 30 |
| rules | agent-rules, system-prompt, coding-standards | 20 |
| workflows | workflow-template, github-actions, automation | 30 |
| mcp | mcp-server, model-context-protocol | 20 |
| knowledge-base | knowledge-base, documentation-generator, rag | 20 |

## Output Location

All research outputs are stored in:
```
dr-evo/preparation/
```

## Example Execution

```
User: /research agents

1. Parse category: "agents"
2. Search GitHub for: "ai-agent-template" (stars >50)
3. Fetch top 30 results
4. For each repo:
   - Get README
   - Extract description
   - Identify use cases
5. Store in memory
6. Write dr-evo/preparation/agents/index.md
7. Update main index
8. Report findings
```

---

*This workflow automates the research and indexing process.*
