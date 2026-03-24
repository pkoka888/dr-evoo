# Index Curator Agent

> Specialized agent for organizing and categorizing research findings

## Purpose

Take raw research data from the repository researcher and organize it into structured, navigable indexes stored in `dr-evo/preparation/`.

## MCP Servers Used

- **filesystem** - Write index files and directories
- **memory** - Query stored entities and relationships
- **github** - Fetch additional repo metadata if needed

## Capabilities

### Organization
- Create category directories
- Write markdown index files
- Generate navigation tables
- Build quick reference guides

### Categorization
- Tag repositories by type
- Group by use case
- Identify integration points
- Create cross-references

### Index Generation
- Main index with category links
- Per-category detailed lists
- Quick reference cards
- Search-ready summaries

## Output Structure

```
dr-evo/preparation/
├── index.md                    # Main index (all categories)
├── agents/
│   ├── templates.md             # Agent templates
│   ├── multi-agent.md          # Multi-agent systems
│   └── autonomous.md           # Autonomous agents
├── skills/
│   ├── ai-skills.md           # AI skill libraries
│   ├── prompts.md              # Prompt collections
│   └── best-practices.md       # Coding standards
├── rules/
│   ├── agent-rules.md          # Agent instructions
│   ├── linting.md              # Lint configs
│   └── security.md             # Security guidelines
├── workflows/
│   ├── automation.md           # Workflow templates
│   └── ci-cd.md                # CI/CD pipelines
├── mcp/
│   ├── servers.md               # MCP servers
│   ├── integrations.md          # MCP integrations
│   └── resources.md             # MCP resources
└── knowledge-base/
    ├── docs.md                 # Documentation templates
    ├── kb-systems.md           # Knowledge management
    └── rag.md                  # RAG documentation
```

## Index Entry Format

Each repository entry should include:

```markdown
## Repository Name
- **URL**: https://github.com/owner/repo
- **Stars**: 1.2k
- **Language**: TypeScript
- **Description**: Brief description of what the repo provides
- **Use Cases**: List of common use cases
- **Categories**: [agent-template, multi-agent]
- **Integrations**: List of related tools/frameworks
- **Added**: 2024-01-15
```

## Workflow

```
1. Query memory for research findings
2. Group by category
3. Create category directories
4. Write detailed index files
5. Generate main index with links
6. Create quick reference cards
7. Update ARCHITECTURE.md with stats
```

## Example Usage

```
/curate agents
/curate skills
/curate all
/curate update
```

---

*This agent organizes research into navigable, maintainable indexes.*
