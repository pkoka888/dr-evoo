# Dr-Evo Agent Architecture

> Research & Knowledge Base Agent System for dr-evo.cz

---

## 📋 Overview

This is the agent system for researching GitHub repositories and building an index of useful sources for AI agents, skills, rules, workflows, MCP servers, and knowledge base.

Inspired by the root `.agent/` architecture, adapted for research automation.

---

## 🏗️ Directory Structure

```plaintext
dr-evo/
├── preparation/           # Research index & organized findings
│   ├── index.md           # Main index with categories
│   ├── agents/            # Agent templates found during research
│   ├── skills/            # Skills & knowledge modules
│   ├── rules/             # Rules & guidelines
│   ├── workflows/         # Workflows & automation
│   ├── mcp/               # MCP servers & integrations
│   └── knowledge-base/    # Knowledge management
└── .agent/                # Agent configuration for research
    ├── agents/            # Research agent definitions
    ├── skills/            # Research skills
    ├── workflows/         # Research workflows
    └── rules/             # Research rules
```

---

## 🤖 Research Agents

| Agent | Purpose | MCP Servers Used |
| ----- | ------- | ----------------- |
| `repository-researcher` | Search GitHub for relevant repositories | github, context7, memory |
| `repository-analyzer` | Analyze repo structure and extract info | filesystem, git |
| `index-curator` | Organize and categorize findings | memory, filesystem |

---

## 🎯 MCP Server Configuration

The research agents utilize the following MCP servers:

```json
{
  "github": {
    "capabilities": "search_repositories, search_code, get_file_contents"
  },
  "filesystem": {
    "capabilities": "list_directory, read_file, write_file"
  },
  "git": {
    "capabilities": "get_commit_history, get_branches, get_diff"
  },
  "context7": {
    "capabilities": "resolve_library_id, query_docs"
  },
  "memory": {
    "capabilities": "create_entities, read_graph, search_nodes"
  }
}
```

---

## 📊 Categories for Research

1. **Agent Frameworks** - Templates, multi-agent systems, autonomous agents
2. **Skills & Knowledge Modules** - AI skill libraries, prompt engineering, best practices
3. **Rules & Guidelines** - Agent rules, linting configs, security guidelines
4. **Workflows & Automation** - CI/CD pipelines, automation scripts
5. **MCP Servers** - MCP integrations, tools, resources
6. **Knowledge Base** - Documentation templates, knowledge management, RAG

---

## 🔄 Research Workflow

```
1. Define search query using MCP GitHub
2. Fetch repository metadata
3. Analyze with filesystem/git tools
4. Query Context7 for documentation
5. Store in memory for reference
6. Write to preparation/ index
```

---

*This architecture is inspired by the root .agent/ system and adapted for research automation.*
