# Saleor Project Agent Rules

**Project:** drdarky.cz E-commerce
**For:** Cline, OpenCode, Claude Code, Kilo Code agents

---

## Project Structure

```
saleor-project/
├── core/           # Saleor API (Python/Django) - USE POETRY
├── dashboard/      # Admin Dashboard (Node.js) - USE PNPM
├── storefront/     # Next.js Storefront - USE PNPM
└── nginx/         # Nginx configs
```

---

## Package Manager Rules

| Component | Manager | Command |
|-----------|---------|---------|
| core/ | Poetry | `poetry install`, `poetry add` |
| storefront/ | pnpm | `pnpm install`, `pnpm add` |
| dashboard/ | pnpm | `pnpm install`, `pnpm add` |

**NEVER:** pip install, npm install, yarn add in saleor-project

---

## Development Commands

```bash
# Start dev environment
docker compose -f saleor-project/docker-compose.yml up -d

# Django shell
docker compose -f saleor-project/docker-compose.yml exec api python manage.py shell

# Migrations
docker compose -f saleor-project/docker-compose.yml exec api python manage.py migrate

# Logs
docker compose -f saleor-project/docker-compose.yml logs -f api
```

---

## Environment Variables

Required in `.env`:
- DATABASE_URL
- REDIS_URL  
- SECRET_KEY
- DEFAULT_CURRENCY=CZK
- DEFAULT_COUNTRY=CZ
- LANGUAGE_CODE=cs

---

## Key Files

- `plans/roadmap.md` - Project phases
- `plans/constitution.md` - Rules
- `plans/PRD-drdarky.md` - Requirements
- `plans/AGENT_PACKAGE_RULES.md` - Package manager safety

---

## Localization

- Default: Czech (cs)
- Secondary: Slovak (sk)
- Tertiary: English (en)

---

## Integrations to Research

- Zásilkovna (shipping)
- Comgate (payments)
- Heureka.cz, Zbozi.cz (feeds)
- Google Analytics 4, Facebook Pixel
- Mautic (CRM)

---

## Personalization (MVP)

- SVG-based visualization
- Text personalization form
- No 3D for MVP

---

**REMINDER:** Always read relevant docs in `plans/` before making changes.
