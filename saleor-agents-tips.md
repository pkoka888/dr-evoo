In the Development phase, your agents should act as Gatekeepers. They don't need to be in an isolated production sandbox yet; they need "Read-Write" access to your local saleor-project so they can fix bugs as they find them.1. Development vs. Production: The Agent RolePhaseAgent FocusEnvironmentDevelopment (Now)Writing Code, GraphQL Queries, Local TestingHost-Linked: Agents run in your IDE (Cursor/VS Code) with direct access to your files.Production (Future)Monitoring, Security Audits, Log AnalysisContainerized: Agents run in isolated "Sidecars" to ensure they can't break the live store.2. The "Czech-Market-Expert" Agent DefinitionSince you are "baking" this specifically for the Czech market, you need an agent that understands the specific nuances of local e-commerce (VAT, Zásilkovna, Heureka).Save this as: dr-evo/.agent/agents/czech-market-expert.mdMarkdown# Role: Czech Market & Localization Specialist
**ID:** czech-market-expert
**Core Objective:** Ensure the Saleor platform is 100% compliant and optimized for the Czech Republic (CZ) market.

## 🎯 Primary Responsibilities
1. **Compliance Audit:** Verify that all prices include/exclude DPH (VAT) correctly (21%, 12% as per 2026 standards).
2. **Localization:** Audit `.json` translation files for linguistic accuracy (e.g., using "Košík" instead of "Nákupní taška").
3. **Integration Bridge:** Help the Backend Specialist map Saleor's shipping methods to the Zásilkovna (Packeta) API.
4. **Feeds:** Ensure the XML feed generator is compatible with Heureka.cz and Zbozi.cz.

## 🛠️ Required Skills
- `i18n-localization`
- `api-patterns/graphql`
- `seo-fundamentals` (specifically for .cz search behavior)

## 📝 Rules of Engagement
- Always use **CZK** as the base currency for examples.
- Distinguish between "Faktura" (Invoice) and "Proforma faktura" in checkout logic.
- Ensure "Ochrana osobních údajů" (GDPR/UOOU) links are present on all forms.

## 🚀 Development Workflow
- **Task:** "Check the Storefront checkout flow for Czech legal requirements."
- **Action:** Review the `storefront/` components for mandatory checkboxes (Terms & Conditions).
3. Suggestions for your "Development Workspace"Since you are in the Development phase, here is how to use your current "Antigravity Kit" effectively:Don't Dockerize Agents yet: In development, keep them as Markdown instructions for your AI Orchestrator (Cursor/Roo Code). It’s faster. You only Dockerize them when you want to automate "Auto-Fixing" on your production server.The "Context" Hack: In your .devcontainer/devcontainer.json, add a mount point for your .agent/ folder. This way, your development container "knows" its own rules.Use the sanity_check.py as a Git Hook: Have your orchestrator.md agent run the sanity check automatically every time you make a change to the core/ or dashboard/ code.
