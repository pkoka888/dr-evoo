---
title: "research-gemini31-summary"
topic: "gemini31-summary"
category: "uncategorized"
status: "draft"
decision_deadline: "2026-03-08"
created: "2026-03-08"
last_modified: "2026-03-08"
authors:
  - "automation"
---

## Findings

Here is a comprehensive summary, critical review, and strategic refinement of the research you’ve conducted for **drdarky.cz** using Saleor.

While the previous AI provided excellent textbook answers, migrating a localized e-commerce store (PrestaShop) to a headless architecture (Saleor) in the real world is full of hidden traps. Let’s look at the gaps, overthinking, and how to optimize your setup—especially regarding your AI/MCP workflow.

---

## 1. High-Level Architecture Summary & Critique

**The Proposed Stack:**

* **Core:** Saleor 3.x (Headless Python/GraphQL)
* **Storefront:** Next.js (React Server Components, Tailwind, React Three Fiber for 3D)
* **Storage:** MinIO on Debian 13 (Direct pre-signed uploads for 100MB+ files)
* **Integrations:** Comgate (Payments), Zásilkovna/GLS (Shipping), Heureka (Feeds), Mautic (CRM), LiteLLM (AI Gateway).

### 🚨 The "App Sprawl" Trap (Overthinking)

The previous AI repeatedly suggested building a "Custom Saleor App" for *every single integration* (one for Comgate, one for Zásilkovna, one for Heureka, one for Mautic).

* **The Reality:** Managing 4-5 separate Next.js/Node microservices (Apps) for a single SMB e-shop is a DevOps nightmare.
* **The Fix:** Build **one monolithic "DrDarky Integration Hub" App**. Use the Saleor App SDK to create a single Next.js project that exposes multiple webhook endpoints (`/api/webhooks/comgate`, `/api/webhooks/zasilkovna`, `/api/webhooks/mautic`). Alternatively, use **n8n** (self-hosted alongside MinIO) to handle all non-UI webhooks (Mautic, Heureka XML generation, GLS backend) without writing custom App code.

---

## 2. Specific Corrections, Gaps, and Tips

### PrestaShop Migration (Data & Passwords)

* **The Gap:** The AI suggested querying the PrestaShop MariaDB `ps_customer` and `ps_orders` directly. PrestaShop’s database is notoriously fragmented (e.g., product data spans `ps_product`, `ps_product_lang`, `ps_product_shop`).
* **Recommendation:** Do not write direct SQL for products/orders. Use PrestaShop's built-in **Web Services API** to extract JSON, or use a robust export module, *then* transform that to Saleor GraphQL.
* **Password Correction:** The AI said you *must* force a password reset. **Correction:** If you are self-hosting Saleor (not Saleor Cloud), Saleor is a Django app. You can actually write a custom `PasswordHasher` in Python that verifies PrestaShop's Bcrypt/MD5 hashes, allowing users to log in with their old passwords, at which point you silently re-hash them into Saleor's default format.

### MinIO and Large Files (Configurators)

* **The Gap (CORS):** The AI correctly recommended direct pre-signed POSTs to MinIO. However, it failed to mention **CORS (Cross-Origin Resource Sharing)**. If your Next.js storefront tries to upload directly to MinIO, the browser will block it unless you specifically configure MinIO's CORS settings to accept PUT/POST requests from `https://www.drdarky.cz`.
* **Tip:** When doing 3D configurations with React Three Fiber, don't store the resulting heavy generated STL in Saleor metadata immediately. Store a lightweight JSON configuration of the user's customizations in `checkoutMetadata`. Only generate the heavy production file via a backend job *after* the order is paid.

### Heureka & Google Analytics

* **The Gap:** Generating the Heureka XML feed via a Python script triggered by a Cron job is fine, but running heavy GraphQL queries to fetch 200+ products and all their variants every hour can spike your Saleor DB CPU.
* **Recommendation:** Use Saleor's `PRODUCT_UPDATED` webhooks to maintain a cached version of the feed (e.g., in Redis or a static file on MinIO) rather than querying the whole database repeatedly.

---

## 3. Mastering MCP for Saleor Development

The previous AI conflated using MCP for *development* with using AI in *production*. **MCP (Model Context Protocol)** is primarily a development tool that allows your IDE (Cursor, Windsurf, Cline) to interact with your local environment.

Here is how you *actually* set up MCP for a massive Saleor project to 10x your coding speed.

### Step 1: The Ultimate Saleor Dev Environment (MCP Setup)

Instead of just giving your AI agent access to GitHub, give it access to your actual database and API schema.

1. **PostgreSQL MCP:** Install a Postgres MCP server.
* *Why?* When you ask Cursor, "How do I query the metadata for an order?", the AI can actually look at your local Saleor database schema to understand exactly how the JSONB metadata column is structured.


2. **Filesystem MCP:** Ensure the AI has full read/write access to your `saleor-storefront` Next.js directory and your `drdarky-integration-hub` directory.
3. **GitHub MCP:** Use the `@modelcontextprotocol/server-github` to let the AI read PrestaShop migration scripts or Saleor SDK documentation from official repositories to write your code.

### Step 2: Properly Setting Up the Env

In Cursor or Cline, configure your `mcp.json` or settings like this:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "your_fine_grained_token" }
    },
    "saleor-postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://saleor:saleor@localhost:5432/saleor"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}

```

*Tip: The `server-fetch` MCP is a secret weapon. You can tell your AI: "Read the Saleor API docs at `https://docs.saleor.io/docs/3.x/api-reference/` and write a GraphQL mutation to create a checkout."*

### Step 3: Using the Saleor App SDK with AI

When instructing your AI to build the Zásilkovna or Comgate integration, use this exact prompt structure to prevent it from hallucinating old Saleor 2.x code:

> *"You are building a Saleor App using Next.js 14 and the official `@saleor/app-sdk`. Do not use older Saleor 2.0 Plugin patterns. I need a webhook handler that listens for `ORDER_FULLY_PAID`. Read the `@saleor/app-sdk` documentation using your tools, then write the API route that extracts the `checkoutMetadata` containing the Zásilkovna Branch ID."*

---

## Summary of Next Steps for drdarky.cz

1. **Consolidate:** Stop planning 5 different apps. Plan **1 Next.js Storefront** and **1 Next.js Saleor App (Integration Hub)**.
2. **Automate:** Spin up **n8n** in your Docker compose. Map Saleor webhooks to n8n for tasks like Mautic syncing and Heureka feed generation. Save your custom code purely for the complex React Three Fiber 3D configurator.
3. **Supercharge Dev:** Set up Cursor/Cline with the **GitHub, Postgres, and Fetch MCP servers**. Use them to safely extract your PrestaShop data and map it directly into Saleor GraphQL bulk mutations.
