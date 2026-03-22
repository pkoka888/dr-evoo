# Kilo Code - Product Requirements Document

## 1. Project Overview

### 1.1 Product Name
**Kilo Code** - Open Source AI Coding Agent

### 1.2 Product Type
VSCode Extension + CLI Tool (Multi-platform AI coding assistant)

### 1.3 Core Feature Summary
Kilo Code is an open source AI coding agent for VS Code that generates code from natural language, automates tasks, and supports 50+ AI models. It serves as a fork of Roo Code, providing autonomous coding capabilities with extensive provider support.

### 1.4 Target Users
- Software developers seeking AI-assisted coding
- Teams wanting self-hosted AI coding solutions
- Developers requiring multi-provider AI model support
- Users wanting CLI-based automation

---

## 2. Technical Architecture

### 2.1 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Tailwind CSS, TypeScript |
| **Backend** | Node.js 20+, VSCode Extension API |
| **Build** | Turbo, pnpm, esbuild |
| **Testing** | Vitest, Playwright |
| **Runtime** | Agent Runtime (standalone Node.js processes) |

### 2.2 Project Structure

```
dr-evoo/
├── src/                    # VSCode Extension (Core)
│   ├── api/               # AI Providers (54 providers)
│   ├── core/tools/        # Agent Tools (27+ tools)
│   ├── services/          # Core Services (25+ services)
│   ├── integrations/      # IDE Integrations
│   ├── extension/         # Extension Entry
│   └── i18n/              # Internationalization
├── webview-ui/            # React Frontend
├── cli/                   # Standalone CLI Package
├── packages/              # Shared Packages
│   ├── agent-runtime/     # Standalone Runtime
│   ├── types/            # TypeScript Types
│   ├── telemetry/        # Telemetry Service
│   ├── evals/            # Evaluation System
│   └── vscode-shim/      # VSCode Mock for Testing
├── apps/                 # Applications
│   ├── kilocode-docs/    # Documentation Site
│   ├── storybook/        # Component Stories
│   ├── vscode-e2e/      # E2E Tests
│   ├── web-roo-code/    # Marketing Website
│   └── evals/           # Evaluation Infrastructure
└── .kilocode/           # Skills & Workflows
```

### 2.3 Key Architectural Components

#### 2.3.1 Agent Runtime Architecture
```
┌─────────────────────┐     fork()      ┌─────────────────────┐
│  CLI / Manager      │ ───────────────▶│  Agent Process      │
│                     │◀───── IPC ─────▶│  (extension host)  │
└─────────────────────┘                 └─────────────────────┘
```

- **ExtensionHost**: Hosts Kilo Code with complete VS Code API mock
- **MessageBridge**: Bidirectional IPC with timeout
- **ExtensionService**: Orchestrates host and bridge lifecycle

#### 2.3.2 Message Protocol
| Direction | Type | Description |
|-----------|------|-------------|
| Parent → Agent | `sendMessage` | Send user message to extension |
| Parent → Agent | `injectConfig` | Update extension configuration |
| Parent → Agent | `shutdown` | Gracefully terminate agent |
| Agent → Parent | `ready` | Agent initialized |
| Agent → Parent | `message` | Extension message |
| Agent → Parent | `stateChange` | State updated |

### 2.4 AI Providers (54 Total)

| Category | Providers |
|----------|-----------|
| **Primary** | Anthropic, OpenAI, Google Gemini |
| **Open Source** | Ollama, LM Studio, HuggingFace |
| **Routed** | OpenRouter, LiteLLM, Vercel AI Gateway |
| **Cloud Providers** | AWS Bedrock, Azure, Vertex, Groq, Cerebras |
| **Chinese** | DeepSeek, Moonshot, MiniMax, Doubao, Qwen |
| **Specialized** | xAI, Mistral, Cohere, Anthropic Vertex |

### 2.5 Agent Tools (27+ Tools)

| Category | Tools |
|----------|-------|
| **File Operations** | ReadFile, WriteToFile, EditFile, DeleteFile, ListFiles |
| **Code Editing** | SearchAndReplace, SearchReplace, ApplyDiff, ApplyPatch, MultiApplyDiff |
| **Search** | SearchFiles, CodebaseSearch |
| **Execution** | ExecuteCommand |
| **Browser** | BrowserAction |
| **AI** | GenerateImage |
| **Flow Control** | NewTask, AskFollowupQuestion, AttemptCompletion, SwitchMode |
| **MCP** | UseMcpTool, AccessMcpResource |
| **Tasks** | UpdateTodoList, RunSlashCommand |

### 2.6 Core Services (25+ Services)

| Service | Purpose |
|---------|---------|
| **mcp** | MCP Protocol Implementation |
| **browser** | Browser Automation |
| **checkpoints** | State Persistence |
| **code-index** | Codebase Indexing |
| **skills** | Skill System |
| **stt** | Speech-to-Text |
| **marketplace** | Extension Marketplace |
| **ghost** | Ghost Service |
| **config** | Configuration Management |
| **settings-sync** | Cloud Settings Sync |
| **tree-sitter** | Code Parsing |

---

## 3. Feature Specifications

### 3.1 Core Features

#### 3.1.1 AI Code Generation
- Natural language to code generation
- Multi-file project creation
- Code explanation and documentation
- Bug detection and fixing

#### 3.1.2 Autonomous Agent
- Task planning and execution
- Tool use with validation
- Error recovery and retry
- Checkpoint/restore for long tasks

#### 3.1.3 Multi-Provider Support
- 54 AI model providers
- Automatic provider fallback
- Cost tracking per provider
- Custom provider configuration

#### 3.1.4 Mode System
- **Architect** - Planning and design
- **Code** - Implementation
- **Ask** - Q&A mode
- **Debug** - Troubleshooting
- **Review** - Code review
- Custom mode creation

#### 3.1.5 MCP Integration
- Model Context Protocol support
- Custom MCP server connections
- Resource access tools

#### 3.1.6 CLI Interface
- Terminal-based AI coding
- Scripting and automation
- Configuration management

### 3.2 Additional Features

#### 3.2.1 Internationalization
- 20+ languages supported
- Automatic translation workflow

#### 3.2.2 Telemetry
- Anonymous usage analytics
- Privacy-preserving design
- User consent management

#### 3.2.3 Checkpoints
- Task state persistence
- Resume interrupted tasks
- History management

#### 3.2.4 Code Index
- Semantic code search
- Codebase understanding
- Context-aware suggestions

---

## 4. Documentation Analysis

### 4.1 Current Documentation Structure

| Document | Purpose |
|----------|---------|
| **AGENTS.md** | Developer onboarding, architecture, code quality rules |
| **CONTRIBUTING.md** | Contribution guidelines, PR process |
| **GEMINI.md** | Local Conductor Protocol (for this workspace) |
| **apps/kilocode-docs/** | Full documentation site (Markdoc-based) |
| **.kilocode/skills/** | Specialized skills for AI agents |
| **.kilocode/workflows/** | Automation workflows |

### 4.2 Documentation Issues Identified

#### 4.2.1 Inaccuracies
1. **jetbrains/ directory**: AGENTS.md references `jetbrains/` directory but it doesn't exist in current workspace
2. **Missing services**: Documentation only mentions "MCP, browser, checkpoints, code-index" but 25+ services exist
3. **Incomplete tools list**: Only mentions "ReadFile, ApplyDiff, ExecuteCommand" but 27+ tools exist

#### 4.2.2 Bloated AGENTS.md
- The main AGENTS.md file is 227 lines and covers multiple concerns
- Should be refactored per progressive disclosure principles

#### 4.2.3 Missing Documentation
- No detailed API for custom tool creation
- No architecture decision records (ADRs)
- Missing deployment/operations documentation

---

## 5. Build & Development

### 5.1 Build Commands

```bash
pnpm install          # Install all dependencies
pnpm build            # Build extension (.vsix)
pnpm lint             # Run ESLint
pnpm check-types      # TypeScript type checking
pnpm test             # Run tests (from package directory)
```

### 5.2 Testing

```bash
# Backend tests
cd src && pnpm test path/to/test-file

# Frontend tests  
cd webview-ui && pnpm test src/path/to/test-file

# E2E tests
cd apps/vscode-e2e && pnpm test
```

### 5.3 Changesets

```bash
pnpm changeset
```

Format:
```md
---
"kilo-code": patch
---
Brief description
```

---

## 6. Fork Process

### 6.1 Upstream Sync
- Kilo Code is a fork of Roo Code
- Periodic merges from upstream using scripts in `scripts/kilocode/`

### 6.2 Change Markers
Kilo-specific changes use `kilocode_change` markers:
```typescript
const value = 42 // kilocode_change
```

**NOT needed in:**
- `cli/` directory
- `jetbrains/` directory
- Any path containing `kilocode`

**ARE needed in:**
- `src/` (except Kilo-specific)
- `webview-ui/`
- `packages/`

---

## 7. Recommendations

### 7.1 Documentation Updates Needed
1. Update AGENTS.md to remove reference to non-existent `jetbrains/` directory
2. Expand services section to include all 25+ services
3. Add complete tools list to documentation
4. Consider splitting AGENTS.md into linked files

### 7.2 Architecture Documentation Needed
1. Add ADR (Architecture Decision Records) in `docs/adr/`
2. Create detailed API documentation for extensions
3. Add deployment/operations guide

### 7.3 Code Quality (Already Good)
- Test coverage requirements ✅
- Lint rules enforced ✅
- Error handling guidelines ✅
- Tailwind CSS for styling ✅

---

## 8. Appendix

### 8.1 Directory Purpose Reference

| Directory | Purpose |
|-----------|---------|
| `src/` | VSCode extension core |
| `webview-ui/` | React chat UI |
| `cli/` | Terminal interface |
| `packages/` | Shared libraries |
| `apps/` | Supporting applications |
| `.kilocode/` | Agent skills/workflows |

### 8.2 Key Files

| File | Purpose |
|------|---------|
| `src/extension.ts` | Extension entry point (23KB) |
| `src/api/index.ts` | API routing |
| `src/core/webview/webviewMessageHandler.ts` | Message handling (157KB) |
| `packages/types/src/` | TypeScript definitions |
| `packages/agent-runtime/src/process.ts` | Agent process spawning |

---

*Generated: 2026-03-22*
*Based on code review of dr-evoo repository*
