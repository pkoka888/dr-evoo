---
applyTo: '**'
---

- Remember to run `scripts/replace-secrets.ps1` after filling in the `$real` hash table with actual secret values.
- All required GitHub Actions secrets are documented in `.github/secrets.md`.
- The secret‑setup guide is in `docs/SECRETS_SETUP.md`.
- After updating `.env`, start the dev stack with `docker compose -f docker-compose.dev.yml up -d` and verify health endpoints.
