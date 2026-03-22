---
title: "Saleor App SDK Overview"
topic: "saleor-app-sdk"
category: "uncategorized"
status: "draft"
decision_deadline: "2026-03-08"
created: "2026-03-08"
last_modified: "2026-03-08"
authors:
  - "automation"
---

## Findings

# Saleor App SDK Overview

**Description**
The Saleor App SDK provides a framework for building extensions (apps) that run alongside a Saleor e‑commerce instance. Two officially supported language stacks exist: a TypeScript/Node SDK (`@saleor/app-sdk`) and a Python SDK (`saleor-app`). Both handle webhook registration, JWT verification, and GraphQL client generation, allowing developers to focus on business logic.

**Core concepts**

- **App manifest** – JSON file that describes required permissions, webhook subscriptions, and UI extensions.
- **Authentication** – Saleor signs every webhook with an HMAC; the SDK validates it automatically.
- **GraphQL client** – A typed client generated from Saleor’s schema; you can execute queries/mutations with the merchant’s access token.

**Building the Integration Hub as a Saleor App**

1. **Create a new project** – `npx @saleor/app-sdk@latest init integration-hub`.
2. **Define manifest** – request `MANAGE_ORDERS`, `MANAGE_PRODUCTS`, and `WEBHOOK_EVENTS`. Add UI extension points for settings (`dashboard:extensions`).
3. **Implement API routes** – use Next.js API routes (`/api/webhooks/order_created`) to handle incoming Saleor events and forward them to external services (BaseLinker, Comgate).
4. **Deploy** – the app can be packaged as a Docker image and installed via Saleor’s “App Registry” UI.

**Example scaffolding (TypeScript)**

```ts
// src/pages/api/webhooks/order_created.ts
import { saleorApp } from "@saleor/app-sdk"

export default saleorApp.createHandler(async (req, res, { app }) => {
	const { payload } = await app.decodeWebhook(req)
	// Transform and forward to BaseLinker
})
```

The SDK also supports background jobs (`@saleor/app-sdk/jobs`) for periodic syncs.

**Key Takeaways**

- The SDK abstracts webhook verification, auth, and GraphQL, dramatically reducing boilerplate.
- Both TypeScript and Python versions are production‑ready; choose based on team expertise.
- The Integration Hub can be delivered as a single Saleor App, simplifying installation and permission management.

**References**

- Saleor App SDK (TypeScript) – https://github.com/saleor/app-sdk
- Saleor App SDK (Python) – https://github.com/saleor/saleor-app-python
- Saleor App development guide – https://docs.saleor.io/docs/3.x/development/apps/sdk/
