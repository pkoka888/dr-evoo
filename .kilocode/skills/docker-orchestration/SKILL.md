# Docker Orchestration Skill

**name:** docker-orchestration

**description:**
Automates the full Docker orchestration pipeline for the dr‑evo project. It can:

- Generate Dockerfiles for any custom service (using a simple Node template).
- Build images with BuildKit secret injection.
- Produce a production‑ready `docker-compose.yml` by merging the dev compose with secret references.
- Validate the final compose file.
- Deploy the stack to Docker Swarm (optional).

**commands:**

- `generate-dockerfiles` – scans `src/`, `webview-ui/`, `cli/` and creates minimal multi‑stage Dockerfiles in `dockerfiles/`.
- `build-images` – builds all services, pushes to the registry, and tags with the current git SHA.
- `generate-prod-compose` – runs `node scripts/generate-prod-compose.js`.
- `validate-compose` – runs `node scripts/validate-compose.js`.
- `deploy-stack` – executes `docker stack deploy -c docker-compose.yml dr-evo` (requires Swarm mode).

**usage example:**

```
/task(description="Docker orchestration" prompt="/docker‑orchestration generate-prod-compose" subagent_type="general")
```
