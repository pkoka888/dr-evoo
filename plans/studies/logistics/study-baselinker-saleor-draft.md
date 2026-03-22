---
title: "BaseLinker ↔ Saleor Integration"
topic: "baselinker-saleor"
category: "logistics"
status: "draft"
decision_deadline: "2026-03-08"
created: "2026-03-08"
last_modified: "2026-03-08"
authors:
  - "automation"
---

## Findings

# BaseLinker ↔ Saleor Integration

**Description**
BaseLinker is a multichannel order manager popular in Central Europe. Its REST‑ful API offers endpoints for orders, products, inventory, and shipping. By synchronising BaseLinker with Saleor you can import orders placed on any marketplace, update stock levels automatically, and push fulfilment data back to BaseLinker.

**BaseLinker API basics**

- Authentication – API token passed in `X-Token` header (per‑account).
- Order fetch – `GET /orders` with pagination (`page`, `limit`).
- Stock update – `PUT /products/{product_id}/stock` with JSON `{ "stock": 42 }`.
- Webhooks – BaseLinker can send `order_created` and `order_status_changed` callbacks.

**Sync flow with Saleor**

1. **Import orders** – A scheduled n8n or Next.js route polls `GET /orders?status=confirmed`. For each order, map BaseLinker fields to Saleor’s order schema (customer, line items, payment). Use Saleor GraphQL mutation `orderCreate`.
2. **Push stock changes** – After an order is fulfilled in Saleor, a webhook triggers a handler that calls BaseLinker’s `PUT /products/.../stock`.
3. **Bidirectional status** – Update Saleor order status (e.g., `FULFILLED`) based on BaseLinker webhook events.

**Auth flow**

- No OAuth – only static API token. Store token securely (env var `BASELINKER_TOKEN`).
- For multi‑tenant SaaS, generate a per‑merchant token via BaseLinker admin UI and associate it with the merchant’s Saleor store in a DB table.

**Open‑source adapters**

- `baselinker-node` – a lightweight Node.js wrapper (https://github.com/marekkrb/baselinker-node).
- `saleor-baselinker-sync` – community GitHub repo that demonstrates order import (https://github.com/karolburda/saleor-baselinker-sync).

**Key Takeaways**

- BaseLinker uses a simple token‑based REST API, making integration straightforward.
- Order import and stock synchronisation can be built with GraphQL mutations in Saleor.
- Existing open‑source wrappers can accelerate development and reduce boilerplate.

**References**

- BaseLinker API reference – https://dev.baselinker.com/
- Saleor GraphQL API – https://docs.saleor.io/docs/3.x/api/graphql/
- baselinker-node NPM package – https://www.npmjs.com/package/baselinker-node
