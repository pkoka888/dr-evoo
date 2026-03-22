---
title: "Stripe Open Banking for Czech Payments"
topic: "stripe-open-banking-cz"
category: "payments"
status: "draft"
decision_deadline: "2026-03-08"
created: "2026-03-08"
last_modified: "2026-03-08"
authors:
  - "automation"
---

## Findings

# Stripe Open Banking for Czech Payments

**Description**
Stripe’s Open Banking (OB) product enables direct‑bank‑transfer payments across Central Europe, including the Czech Republic (CZ). Instead of traditional card processing, OB routes payments through the payer’s bank using the ISO‑20022 standard, delivering higher success rates and lower fees for local transactions.

**Merchant requirements**

- **Stripe account** – must be enabled for “Europe – Open Banking” (request via Stripe dashboard).
- **Czech‑registered business** – legal entity and bank account in CZ to receive payouts.
- **Verification** – provide additional documentation (company registration, proof of bank account) to satisfy Stripe’s KYC for OB.

**API differences**
| Feature | Card payments (default) | Open Banking (CZ) |
|---------|------------------------|-------------------|
| Endpoint | `POST /v1/payment_intents` | Same endpoint, but set `payment_method_types[]=bank_transfer` and `payment_method_options[bank_transfer][country]=CZ` |
| Confirmation flow | Immediate (client secret) | Redirect to bank‑selected page; webhook `payment_intent.succeeded` fires after bank settlement (usually 1‑3 business days). |
| Fees | ~1.4 % + 0.25 USD | ~0.8 % + 0.30 CZK (lower cost). |
| Payout schedule | Daily/weekly (standard) | Same as card; payouts arrive to Czech IBAN. |

**Implementation notes**

- Use `payment_method_options[bank_transfer][mandate_options][reference]` to set a merchant reference visible to the payer.
- Listen to `payment_intent.payment_failed` for cases where the bank rejects the transfer.
- OB payments are not available in test mode; use Stripe’s “bank_transfer” test cards with `client_secret` and simulate success via the Dashboard.

**Key Takeaways**

- Open Banking offers cheaper, higher‑success Czech payments but requires explicit merchant onboarding.
- The same Stripe PaymentIntent flow is used; only `payment_method_types` and country options differ.
- Webhook handling must accommodate slower settlement times and possible retries.

**References**

- Stripe Open Banking docs – https://stripe.com/docs/payments/open-banking
- Czech‑specific bank‑transfer guide – https://stripe.com/docs/payments/ideal#czech-republic
- ISO‑20022 overview – https://www.iso20022.org/
