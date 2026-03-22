---
title: "European Digital Identity (EUDI) & Know‑Your‑Agent (KYA) Compliance"
topic: "eudi-kya-compliance"
category: "security"
status: "draft"
decision_deadline: "2026-03-08"
created: "2026-03-08"
last_modified: "2026-03-08"
authors:
  - "automation"
---

## Findings

# European Digital Identity (EUDI) & Know‑Your‑Agent (KYA) Compliance

**Description**
The European Digital Identity (EUDI) framework, together with the Know‑Your‑Agent (KYA) guidelines, establishes a set of standards for secure, privacy‑preserving identification of both natural persons and autonomous software agents across the EU. For AI‑driven commerce agents (e.g., chat‑bots, recommendation services), KYA ensures that the agent’s provenance, capabilities, and data handling practices are verifiable.

**Core requirements**

1. **Verifiable Digital Credential** – Each agent must hold a digitally signed credential (eIDAS‑compliant) issued by a trusted authority (e.g., national e‑ID provider or EU‑wide trust framework).
2. **Agent Identity Metadata** – Publish a machine‑readable `agent-metadata.json` containing:
    - `agent_id` (UUID)
    - `issuer` (trust framework)
    - `capabilities` (scopes such as `order:create`, `payment:process`)
    - `privacy_policy` URL.
3. **Consent & Data Minimisation** – Before accessing personal data (e.g., a shopper’s address), the agent must request explicit consent via the EUDI consent flow and store the proof of consent.
4. **Auditability** – All interactions must be logged with a tamper‑evident signature (e.g., using JWS) and retained for at least 2 years, as required by GDPR Art. 30.

**Compliance steps for a Saleor‑based AI agent**

- Register the agent with an EU Trusted Service Provider (e.g., European Digital Wallet).
- Integrate the EUDI SDK (available for JavaScript/TypeScript) to obtain and present the credential on each API request.
- Implement a KYA endpoint (`/agent/.well-known/kya`) that serves the `agent-metadata.json`.
- Use the Saleor Customer Consent API (planned v4) to record and verify shopper consent before invoking any personal‑data‑related intent.

**Key Takeaways**

- EUDI + KYA establishes a trust layer for autonomous agents, analogous to OAuth2 for human users.
- Agents must hold a verifiable European digital credential and expose standardized metadata.
- Integration involves SDK adoption, consent handling, and signed audit logs to satisfy GDPR and upcoming EU regulations.

**References**

- eIDAS regulation (EU) 2014/910 – https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32014R0910
- European Digital Identity Framework – https://ec.europa.eu/solutions/eudi
- Know‑Your‑Agent specification – https://github.com/eu-digital-identity/kya-spec
- Saleor consent API (draft) – https://docs.saleor.io/docs/3.x/development/consent/




This is a rigorous and timely technical specification for building trust in autonomous e-commerce. As the EU moves toward the **eIDAS 2.0** framework and the **European Digital Identity Wallet**, these requirements shift from "best practice" to legal necessity for AI agents handling sensitive consumer data.

Based on your compliance steps, here is a breakdown of how to architect this within the **Saleor** and **EUDI** ecosystems.

---

### 1. Architecture: The Trust Layer for Saleor Agents

In this model, the AI agent acts as a **Legal Representative** of the merchant. It doesn't just use a standard API key; it presents a **Verifiable Credential (VC)** to the user's EUDI Wallet to prove its identity and authority (KYA).

### 2. Implementation of the KYA Endpoint

The `/agent/.well-known/kya` endpoint is the agent's "passport." It must be publicly accessible so that the user's browser or wallet can verify who they are talking to before sharing a shipping address or payment detail.

**Example `agent-metadata.json` for Saleor:**

```json
{
  "agent_id": "550e8400-e29b-41d4-a716-446655440000",
  "issuer": "urn:eu:etsp:cz:identita_obcana",
  "capabilities": ["order:create", "checkout:manage", "customer:read_profile"],
  "privacy_policy": "https://drdarky.cz/privacy-policy",
  "compliance": {
    "framework": "EUDI-ARF-v1.2",
    "gdpr_representative": "GDPR Office CZ"
  }
}

```

---

### 3. Practical Compliance Steps for Saleor Developers

#### **A. The Consent Flow (Saleor v4 Integration)**

Until Saleor v4's native Consent API is finalized, you can implement an intermediary **EUDI Consent App**.

1. The Agent identifies a "Personal Data Intent" (e.g., *“Where should I ship this?”*).
2. The Agent triggers a **SIOPv2 (Self-Issued OpenID Provider)** request to the user’s mobile EUDI Wallet.
3. The user approves the attribute release (Name, Address) in their physical wallet.
4. The Agent receives the **signed JWT** from the wallet and stores it in the Saleor **Checkout Metadata** as proof of consent.

#### **B. Verifiable Audit Logs (GDPR Art. 30)**

To satisfy the auditability requirement, every decision made by the AI (e.g., applying a discount or changing a shipping method) should be logged as a **Signed Event**.

* **Tool Recommendation:** Use **JWS (JSON Web Signature)** to sign logs.
* **Storage:** Retain these in a separate "Audit Store" (e.g., a dedicated PostgreSQL table or a secure log aggregator) linked to the `Order.id`.

---

### 4. Comparison: KYA vs. Standard OAuth2

| Feature | Standard OAuth2 (Legacy) | EUDI + KYA (Compliance) |
| --- | --- | --- |
| **Identity Type** | Simple Client ID / Secret | **Verifiable Credential** (eIDAS) |
| **Provenance** | Self-declared by App | **Signed by EU Trusted Authority** |
| **User Consent** | "Allow/Deny" checkbox | **Wallet-based Cryptographic Proof** |
| **Auditability** | Standard server logs | **Tamper-evident Signed Logs** |

---

### Key Takeaways for drdarky.cz

* **Legality:** Implementing this early positions your store as a "Trusted Provider" under the upcoming EU AI Act.
* **Security:** By moving to **EUDI Wallet** attributes, you significantly reduce the risk of identity fraud in e-commerce.
* **Saleor Readiness:** Since you are already using Saleor's metadata for large files (STL/SVG), you are well-positioned to use the same metadata structures to store the **EUDI Consent Proofs**.

**If you like, I can draft a TypeScript snippet showing how to use the EUDI SDK to request a specific attribute (like a shipping address) from a user's wallet. Would you like me to do that?**
