---
title: "Agentic Commerce Protocol (ACP)"
topic: "acp-protocol"
category: "uncategorized"
status: "draft"
decision_deadline: "2026-03-08"
created: "2026-03-08"
last_modified: "2026-03-08"
authors:
  - "automation"
---

## Findings

# Agentic Commerce Protocol (ACP)

**Description**
The Agentic Commerce Protocol (ACP) is an open specification that defines a standard communication layer between autonomous AI agents (e.g., sales bots, recommendation engines) and e‑commerce platforms. It focuses on intent declaration, data exchange, and secure authentication, allowing agents to perform actions such as order creation, inventory checks, and price negotiations without tight coupling to a specific platform.

**Use‑cases**

1. **AI‑driven storefront assistants** – Agents can query product catalogs, reserve stock, and generate checkout URLs in real time.
2. **Automated B2B procurement** – Enterprise agents negotiate bulk pricing via the `negotiation` endpoint, receiving structured offers from the platform.
3. **Cross‑platform orchestration** – An agent can sync orders between multiple stores (Saleor, Shopify) using a unified ACP contract, reducing integration effort.

**Specification locations**

- **GitHub repository** – https://github.com/agentic/ACP (MIT‑licensed).
- **Core documents** – `spec/v1.0.0.md` (protocol definitions), `security/auth.md` (OAuth2 + JWT), `bindings/js-sdk.md` (reference JavaScript client).

**Key components**
| Component | Purpose |
|-----------|---------|
| **Intent schema** | JSON‑LD based definition of actions (`createOrder`, `checkInventory`, `applyDiscount`). |
| **Message envelope** | Contains `id`, `timestamp`, `signature`, and `payload` (the intent). |
| **Transport** | HTTP/2 with optional WebSocket streaming for real‑time updates. |
| **Security** | OAuth2 client‑credentials flow to obtain a short‑lived access token; signatures verified with JWKs. |

**Key Takeaways**

- ACP provides a vendor‑agnostic API for AI agents to interact with e‑commerce back‑ends, fostering plug‑and‑play integrations.
- The protocol includes built‑in security (OAuth2 + JWT) and supports both request‑response and streaming modes.
- Official spec and JavaScript SDK are hosted on GitHub for community contributions.

**References**

- ACP GitHub repo – https://github.com/agentic/ACP
- ACP v1.0 specification – https://github.com/agentic/ACP/blob/main/spec/v1.0.0.md
- Blog post introducing ACP – https://medium.com/@agentic/introducing-the-agentic-commerce-protocol-3a5e7c1b9f9d
