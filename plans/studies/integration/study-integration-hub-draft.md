---
title: "Single‑App Integration Hub Pattern"
topic: "integration-hub"
category: "integration"
status: "draft"
decision_deadline: "2026-03-08"
created: "2026-03-08"
last_modified: "2026-03-08"
authors:
  - "automation"
---

## Findings

# Single‑App Integration Hub Pattern

**Description**
The Integration Hub is a dedicated web application that centralises all third‑party connections (order, inventory, payment, marketplace) for a Saleor deployment. Instead of scattering separate Saleor apps for each integration, a single Next‑JS app hosts API routes that act as proxies to external services and provide a unified UI for configuration.

**Benefits vs. multiple Saleor apps**

1. **Simplified onboarding** – Merchants install only one app and configure all connectors in one dashboard.
2. **Reduced maintenance overhead** – One codebase, one CI pipeline, and a single versioning strategy.
3. **Consistent security model** – Centralised authentication (OAuth2/JWT) and rate‑limiting can be applied uniformly.

**Recommended tech stack**
| Layer | Recommended technology |
|------|--------------------------|
| Front‑end | Next.js 14 (app router) with Tailwind CSS |
| API | Next.js API routes (Node.js 20) |
| Database | PostgreSQL (shared with Saleor) via Prisma ORM |
| Auth | Next‑Auth.js (OAuth2 providers) + Signed JWT for Saleor webhook verification |
| DevOps | Docker, GitHub Actions, Vercel or self‑hosted Kubernetes |

**Security considerations**

- Verify Saleor webhooks using the HMAC signature (`Saleor-Signature`) and enforce a short TTL.
- Store external API secrets in environment variables or Azure/AWS secret manager; never commit to repo.
- Apply CSP and same‑site cookies for the UI; limit CORS to the Saleor domain.
- Log all outbound requests and enforce GDPR‑compatible data retention policies.

**Key Takeaways**

- A single‑app hub reduces version drift and simplifies merchant provisioning.
- Next.js provides a lightweight yet powerful platform for both UI and secure API endpoints.
- Centralised secret management and webhook verification are essential for compliance.

**References**

- Saleor Apps documentation – https://docs.saleor.io/docs/3.x/development/apps/
- Next.js API routes guide – https://nextjs.org/docs/api-routes/introduction
- OAuth2 best practices – https://oauth.net/2/
