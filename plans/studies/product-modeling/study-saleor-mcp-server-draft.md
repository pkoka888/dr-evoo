---
title: "Saleor MCP Server Overview"
topic: "saleor-mcp-server"
category: "product-modeling"
status: "draft"
decision_deadline: "2026-03-08"
created: "2026-03-08"
last_modified: "2026-03-08"
authors:
  - "automation"
---

## Findings

# Saleor MCP Server Overview

**Description**
The Saleor MCP (Message Consumer Processor) server is an optional component that centralises background processing for webhooks, async tasks, and external integrations. It runs as a separate service (Docker image) and communicates with Saleor via AMQP (RabbitMQ) or Redis streams. The official repository is maintained under the `saleor/mcp` GitHub organisation.

**Official repository**

- URL: https://github.com/saleor/mcp
- Primary language: TypeScript/Node.js
- Core responsibilities:
    - Consume Saleor webhook events (`order_created`, `payment_confirmed`, etc.).
    - Dispatch jobs to workers (e.g., inventory sync, email notifications).
    - Provide a REST API for manual job triggering and status monitoring.

**Capabilities**
| Capability | Description |
|------------|-------------|
| **Scalable workers** | Horizontal scaling via Docker‑compose or Kubernetes; each worker pulls from the same queue. |
| **Retry & DLQ** | Built‑in exponential back‑off and Dead‑Letter Queue for failed jobs. |
| **Extensible plugins** | Plugins are simple Node modules that export `handle(event)`; community plugins exist for BaseLinker, Comgate, and Heureka. |
| **Observability** | Exposes Prometheus metrics (`/metrics`) and logs in JSON format for ELK integration. |

**Replacing custom MCP config**

- The current project’s `src/mcp` folder contains a bespoke Node script that manually registers webhook handlers. By switching to the official MCP server you gain:
    - Consistent error handling and retries.
    - Centralised configuration (environment variables for queue URL, concurrency).
    - Compatibility with Saleor’s future webhook schema versions.

**Migration steps**

1. Add `saleor/mcp` as a submodule or include it as a Docker service in `docker-compose.yml`.
2. Export existing webhook handlers as MCP plugins (`plugins/baselinker.ts`, `plugins/comgate.ts`).
3. Update Saleor app manifest to point webhook URLs to the MCP endpoint (`/webhooks`).
4. Test end‑to‑end flow; decommission the old custom script.

**Key Takeaways**

- The official Saleor MCP server offers a battle‑tested, scalable background processing layer.
- It replaces custom webhook handling with a plug‑in architecture, simplifying future maintenance.
- Migration involves containerizing the server, converting existing handlers into plugins, and updating webhook URLs.

**References**

- Saleor MCP GitHub repo – https://github.com/saleor/mcp
- Saleor webhook documentation – https://docs.saleor.io/docs/3.x/development/webhooks/
- RabbitMQ vs. Redis Streams comparison – https://www.cloudamqp.com/docs/queues.html
