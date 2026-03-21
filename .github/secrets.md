# Repository Secrets Required

The CI workflow expects the following secrets (exact names must match):

| Secret Name                     | Description                                                 |
| ------------------------------- | ----------------------------------------------------------- |
| `SSH_KEY_PATH`                  | Path to SSH private key for deployment (optional)           |
| `SSH_PUBLIC_KEY_PATH`           | Path to the public part of the deployment key               |
| `GITHUB_ACTIONS_SSH_KEY`        | Private SSH key used by GitHub Actions to access the server |
| `GITHUB_ACTIONS_SSH_PUBLIC_KEY` | Corresponding public key                                    |
| `KILOCODE_API_KEY`              | KiloCode platform API token                                 |
| `KILOCODE_POSTHOG_API_KEY`      | PostHog analytics token                                     |
| `GEMINI_API_KEY`                | Google Gemini (Vertex AI) API key                           |
| `OLLAMA_API_KEY`                | Ollama authentication token                                 |
| `OPENCODE_API_KEY`              | OpenCode AI provider token                                  |
| `GITHUB_TOKEN`                  | General‑purpose GitHub PAT (repo, workflow scopes)          |
| `GITHUB_API_KEY`                | Additional GitHub PAT if needed                             |
| `OPENROUTER_API_KEY`            | OpenRouter gateway token                                    |
| `DEEPSEEK_API_KEY`              | DeepSeek LLM token                                          |
| `NVIDIA_API_KEY`                | NVIDIA NGC / NIM API key                                    |
| `OPENAI_API_KEY`                | OpenAI API key                                              |
| `SECRET_KEY`                    | Django secret key (32‑byte base64)                          |
| `DATABASE_PASSWORD`             | PostgreSQL password for the `saleor` user                   |
| `REDIS_URL`                     | Redis connection URL (e.g. `redis://redis:6379/0`)          |
| `STRIPE_PUBLIC_KEY`             | Stripe publishable key                                      |
| `STRIPE_SECRET_KEY`             | Stripe secret key                                           |
| `STRIPE_WEBHOOK_SECRET`         | Stripe webhook secret                                       |
| `EMAIL_HOST_PASSWORD`           | SMTP password for `EMAIL_HOST_USER`                         |
| `BASELINKER_API_KEY`            | BaseLinker logistics API token                              |
| `GIT_API_GRAINED_TOKEN`         | GitHub fine‑grained token for repo‑specific actions         |

Add each of the above as a **Repository secret** under **Settings → Secrets & variables → Actions**.
