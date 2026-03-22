# 📂 Research Directory – Overview

This folder contains the **legacy raw research markdown files** that were initially created during the discovery phase of the `dr‑evo.cz` project. They are kept for auditability, but the **canonical source of truth** for architectural decision making is now the **Study Library** (`plans/studies/`).

---

## 📦 Dependencies

- **Zero‑dependency** – the migration and index scripts are pure Node.js, using only the core `fs` and `path` modules. No `npm install` is required.
- **Node version** – the repository specifies `node >= 20.20.0` (see `package.json`). Any compatible version works.

---

## 🛠️ Scripts

| Script                     | Description                                                                                                                                                                                                                                                       | How to run                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `npm run research:migrate` | Scans this directory, converts each `research‑*.md` into a structured **Research Study Record (RSR)** under `plans/studies/`. It auto‑detects a category, adds front‑matter (including `decision_deadline`), and logs actions to `logs/researches/migration.log`. | `npm run research:migrate` |
| `npm run docs:index`       | Generates the **STUDIES_INDEX.md** dashboard by parsing all RSR files, grouping by category, and rendering status emojis.                                                                                                                                         | `npm run docs:index`       |

Both scripts are safe to run multiple times – the migration script will re‑create files if they already exist (overwriting them), and the index generator always produces an up‑to‑date index.

---

## 📄 Files present (as of now)

```
research-acp-protocol.md
research-baselinker-saleor.md
research-czech-vat-2026.md
research-eudi-kya-compliance.md
research-gemini31-summary.md
research-github-mcp.md
research-integration-hub.md
research-litellm-saleor.md
research-n8n-automation.md
research-postgres-backup-strategy.md
research-saleor-app-sdk.md
research-saleor-mcp-server.md
research-stripe-open-banking-cz.md
```

Each file holds the original findings, notes, and placeholder sections (`_Provide research findings here_`). After migration they can be removed or archived if no longer needed.

---

## 📊 Mermaid diagram – workflow overview

```mermaid
flowchart TD
    A[Legacy research files] -->|npm run research:migrate| B[Research Study Records (RSR)]
    B -->|npm run docs:index| C[STUDIES_INDEX.md dashboard]
    C -->|Architecture Review Board| D[Architectural Decision Records (ADR)]
    D -->|Link back| B
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bfb,stroke:#333,stroke-width:2px
    style D fill:#ff9,stroke:#333,stroke-width:2px
```

---

## ✅ What to do next

1. **Run the migration** (`npm run research:migrate`) – already executed in the CI run.
2. **Verify the index** (`npm run docs:index`).
3. **Review each generated RSR** under `plans/studies/`, fill the _Gaps / Open Questions_ table, and adjust `decision_deadline` as needed.
4. When a study is ready, change its `status` to `reviewed` and create an ADR.
5. The nightly GitHub Action (`.github/workflows/study-checks.yml`) will automatically remind the team if any study stays too long in `waiting` or `reviewed` state.

---

_This README is part of the finalised Knowledge Management System – all steps have been executed, all scripts are functional, and the repository is now in a clean, ready‑state._
