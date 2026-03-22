---
title: "Czech VAT Reform 2026"
topic: "czech-vat-2026"
category: "uncategorized"
status: "draft"
decision_deadline: "2026-03-08"
created: "2026-03-08"
last_modified: "2026-03-08"
authors:
  - "automation"
---

## Findings

# Czech VAT Reform 2026

**Description**
Effective 1 January 2026, the Czech Republic will replace its reduced‑rate system (10 % for food, 15 % for books, etc.) with a simplified two‑rate model: a standard 21 % rate and a reduced 12 % rate for a limited set of goods and services (e.g., medicines, printed books). This change aims to align Czech VAT with EU recommendations and reduce administrative burden.

**Impact on Saleor**

- **Tax class configuration** – Saleor’s `TaxClass` model must be updated to reflect the new 12 % rate and map existing product categories accordingly.
- **Automatic tax calculation** – If using the Saleor Tax App (e.g., TaxJar, Avalara), the provider will need to be updated to the Czech 2026 rates; otherwise, custom tax logic must be added to the `taxes` webhook.
- **Migration steps** –
    1. Export current `TaxClass` data (`python manage.py dumpdata tax.TaxClass`).
    2. Create new `TaxClass` entries for 12 % and 21 %.
    3. Re‑assign products via a bulk update script (`saleor/manage.py update_tax_class --old-rate=15 --new-rate=12`).
    4. Adjust invoices‑generation templates to display the new rates.

**Compliance considerations**

- **Invoice requirements** – Invoices must display the applied VAT rate and the total VAT amount.
- **Reporting** – The Czech tax authority (Finanční správa) expects monthly VÚ (VAT) reports; ensure the tax export format matches the new rate codes (12 % = `S12`, 21 % = `S21`).

**Key Takeaways**

- The 2026 reform reduces the number of VAT rates to two, requiring a migration of product tax classes in Saleor.
- Both built‑in and external tax providers will need to be updated to support the new 12 % rate.
- A bulk migration script and updated invoice templates are essential to stay compliant before the 2026 deadline.

**References**

- Czech Ministry of Finance – VAT reform announcement (Czech) – https://www.mfcr.cz/cs/legislativa/dane/dph/novela-dph-2026
- EU VAT simplification guidelines – https://ec.europa.eu/taxation_customs/business/vat/eu-vat-rules-topic/vat-simplification
- Saleor tax handling docs – https://docs.saleor.io/docs/3.x/development/taxes/
