---
title: "n8n Automation Overview"
topic: "n8n-automation"
category: "infrastructure"
status: "draft"
decision_deadline: "2026-03-08"
created: "2026-03-08"
last_modified: "2026-03-08"
authors:
  - "automation"
---

## Findings

# n8n Automation Overview

**Description**
n8n is an open‑source workflow automation tool that allows you to connect APIs, SaaS services, and custom scripts through a visual editor. It runs on Node.js, supports self‑hosting, and offers a marketplace of pre‑built nodes. Because it is extensible and runs on inexpensive infrastructure, it is a solid candidate for the Integration Hub that must orchestrate data between Saleor and various local Czech e‑commerce services.

**Why n8n fits the Integration Hub**

- **Connector‑centric architecture** – each service (BaseLinker, Comgate, Heureka, etc.) is represented by a node, making it trivial to compose multi‑step flows without writing boilerplate code.
- **Self‑hosted & GDPR‑compliant** – you retain full control of data, a critical requirement for Czech merchants handling personal and payment data.
- **Extensible JavaScript functions** – custom logic such as order transformation or tax‑rate mapping can be added directly inside a node.

**Key n8n connectors**
| Service | Node name | Typical use case |
|---------|-----------|------------------|
| BaseLinker | `BaseLinker` (community) | Pull new orders, push stock updates |
| Comgate | `Comgate` (community) | Create payment links, verify status |
| Heureka | `Heureka Feed` (custom) | Export product catalog XML |

**Deployment notes**

- Docker compose is the recommended production setup: `docker run -d -p 5678:5678 n8nio/n8n`.
- Persist the SQLite DB or switch to PostgreSQL (`DB_TYPE=postgresdb`).
- Enable basic auth and TLS termination via a reverse proxy (NGINX) to meet PCI‑DSS and GDPR requirements.
- Use environment variables for API keys; rotate them regularly.

**Key Takeaways**

- n8n provides a low‑code way to stitch together BaseLinker, Comgate, Heureka and Saleor.
- Self‑hosting gives full data residency control required for Czech compliance.
- Docker + PostgreSQL deployment offers scalability and reliability for production.

**References**

- Official n8n docs – https://docs.n8n.io/
- BaseLinker API documentation – https://dev.baselinker.com/
- Comgate API overview – https://www.comgate.cz/api
- Heureka integration guide – https://docs.heureka.cz/
