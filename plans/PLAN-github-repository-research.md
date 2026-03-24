# GitHub Repository Research Plan: Agent/Skill/Workflow/MCP/Knowledge Base Index

**Objective:** Research GitHub repositories to create a comprehensive index of useful sources for AI agents, skills, rules, workflows, MCP servers, and knowledge base. Execute research using an automated research agent setup and organize results.

---

## 📁 Target Directories

| Directory | Purpose |
| --------- | --------|
| `dr-evo/preparation/` | Store research index, organized findings, and source references |
| `dr-evo/.agent/` | Configure agents, modes, skills, rules, and workflows for research automation |

---

## 🔬 Research Categories

Define specific categories to search on GitHub:

### 1. Agent Frameworks & Templates

| Category | Search Keywords | Examples |
| -------- | --------------- | -------- |
| Agent Templates | `ai-agent-template`, `claude-agent`, `agent-scaffold` | Roo Code, eliza, crewai |
| Multi-Agent Systems | `multi-agent`, `agent-orchestration`, `agent-team` | AutoGen, ChatDev |
| Autonomous Agents | `autonomous-agent`, `agent-loop`, `agent-tool-use` | OpenHands, Olas |

### 2. Skills & Knowledge Modules

| Category | Search Keywords | Examples |
| -------- | --------------- | -------- |
| AI/Skill Libraries | `ai-skill`, `agent-skill`, `capability-module` | LangChain, LangGraph |
| Prompt Engineering | `prompts`, `prompt-library`, `prompt-engineering` | Awesome Prompts |
| Best Practices | `coding-best-practices`, `style-guide`, `code-standards` | Google Style Guides |

### 3. Rules & Guidelines

| Category | Search Keywords | Examples |
| -------- | --------------- | -------- |
| Agent Rules | `agent-rules`, `agent-instructions`, `system-prompt` | Various agent configs |
| Linting/Validation | `eslint-config`, `prettier-config`, `lint-rules` | Standard JS, Airbnb |
| Security Rules | `security-rules`, ` OWASP`, `secure-coding` | Security Code Datasets |

### 4. Workflows & Automation

| Category | Search Keywords | Examples |
| -------- | --------------- | -------- |
| Workflow Templates | `workflow-template`, `ci-cd-pipeline`, `github-actions` | Actions Starter |
| Automation Scripts | `automation-scripts`, `task-automation`, `bot-scripts` | Various bots |
| DevOps Workflows | `devops-automation`, `infrastructure-as-code` | Terraform, Ansible |

### 5. MCP (Model Context Protocol)

| Category | Search Keywords | Examples |
| -------- | --------------- | -------- |
| MCP Servers | `mcp-server`, `model-context-protocol`, `mcp-tools` | MCP official, community |
| MCP Integrations | `mcp-integration`, `mcp-client`, `mcp-examples` | Various integrations |
| MCP Resources | `mcp-resource`, `mcp-knowledge`, `mcp-memory` | Memory, filesystem servers |

### 6. Knowledge Base & Documentation

| Category | Search Keywords | Examples |
| -------- | --------------- | -------- |
| Documentation Sites | `docs-template`, `documentation-generator`, `docs-site` | Docusaurus, GitBook |
| Knowledge Management | `knowledge-base`, `second-brain`, `wiki-system` | Obsidian, Wiki.js |
| AI Documentation | `ai-docs`, `llm-documentation`, `rag-documentation` | RAG examples |

---

## 🎯 Research Agent Configuration

Create the following setup in `dr-evo/.agent/`:

### Research Agent

```yaml
# .agent/agents/research-agent.md
name: Research Agent
purpose: Systematically search GitHub for relevant repositories
skills:
  - github-search
  - repository-analysis
  - content-categorization
  - knowledge-graph
workflow: /research
```

### Repository Analyzer Agent

```yaml
# .agent/agents/repository-analyzer.md
name: Repository Analyzer
purpose: Analyze repository structure, README, and extract key information
skills:
  - code-analysis
  - documentation-review
  - metadata-extraction
```

---

## 📋 Research Workflow

Define workflow in `dr-evo/.agent/workflows/`:

```markdown
# /research workflow

1. Search GitHub for repositories matching category keywords
2. Filter by stars (min 50), recent updates (1 year)
3. Clone/fetch repository metadata
4. Analyze README and key files
5. Extract: description, use cases, integrations
6. Categorize and tag repository
7. Generate index entry with link and summary
8. Store in dr-evo/preparation/
```

---

## 📊 Index Structure

Create organized files in `dr-evo/preparation/`:

```
dr-evo/preparation/
├── index.md                           # Main index with categories
├── agents/
│   ├── templates.md                   # Agent templates
│   ├── multi-agent.md                 # Multi-agent systems
│   └── autonomous.md                  # Autonomous agents
├── skills/
│   ├── ai-skills.md                   # AI/skill libraries
│   ├── prompts.md                     # Prompt collections
│   └── best-practices.md              # Coding standards
├── rules/
│   ├── agent-rules.md                 # Agent instructions
│   ├── linting.md                     # Lint configs
│   └── security.md                    # Security guidelines
├── workflows/
│   ├── automation.md                  # Workflow templates
│   └── ci-cd.md                       # CI/CD pipelines
├── mcp/
│   ├── servers.md                     # MCP servers
│   ├── integrations.md                # MCP integrations
│   └── resources.md                   # MCP resources
└── knowledge-base/
    ├── docs.md                        # Documentation templates
    ├── kb-systems.md                   # Knowledge management
    └── rag.md                          # RAG documentation
```

---

## 🔄 Research Execution Steps

### Step 1: Setup Research Agent
- Create research agent in `.agent/agents/`
- Define skills for GitHub search
- Configure workflow

### Step 2: Execute Category Research
- Run searches per category
- Collect top 20-50 repositories per category
- Document findings

### Step 3: Analyze & Index
- Analyze each repository
- Extract relevant metadata
- Create structured index

### Step 4: Organize Results
- Save to `dr-evo/preparation/`
- Create navigation index
- Add to `.agent/` for future reference

---

## 🛠️ Tools & Methods

| Method | Tool | Purpose |
|--------|------|---------|
| GitHub Search | `mcp__github__search_repositories` | Find relevant repos |
| Code Search | `mcp__github__search_code` | Find specific patterns |
| Issue Search | `mcp__github__search_issues` | Find discussions |
| File Operations | `filesystem` | Save results locally |

---

## 📝 Output Deliverables

1. **Research Index** - Comprehensive markdown index in `dr-evo/preparation/`
2. **Research Agent** - Configured agent for future research tasks
3. **Categorized Sources** - Organized by agents, skills, rules, workflows, MCP, knowledge base
4. **Quick Reference** - Summary cards for quick lookup

---

## ⚡ Next Steps (Action Items)

1. [x] Created directory structure in `dr-evo/preparation/`
2. [x] Created research agents in `dr-evo/.agent/agents/`
   - `repository-researcher.md` - For GitHub search and analysis
   - `index-curator.md` - For organizing findings
3. [x] Defined research skills in `dr-evo/.agent/skills/`
   - `github-research.md` - GitHub search capabilities
   - `knowledge-graph.md` - Memory storage capabilities
4. [x] Created `/research` workflow in `dr-evo/.agent/workflows/`
5. [ ] Execute GitHub searches per category
6. [ ] Organize results into index files in `dr-evo/preparation/`

---

## 📦 What Was Created

### Directory Structure
```
dr-evo/
├── .agent/
│   ├── ARCHITECTURE.md          # Agent system overview
│   ├── agents/
│   │   ├── repository-researcher.md
│   │   └── index-curator.md
│   ├── skills/
│   │   ├── github-research.md
│   │   └── knowledge-graph.md
│   └── workflows/
│       └── research.md
└── preparation/
    └── README.md               # Research index directory
```

### MCP Server Integration
The research agents use the following MCP servers from `.kilocode/mcp.json`:
- **github** - For repository search and analysis
- **filesystem** - For file operations
- **git** - For repository analysis
- **context7** - For documentation lookup
- **memory** - For knowledge graph storage

---

*Plan created for research task execution.*
