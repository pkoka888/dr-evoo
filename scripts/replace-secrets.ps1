# PowerShell script to replace placeholder values in .env with real secrets
# ---------------------------------------------------------------
# Usage:
#   1. Open this script in an editor.
#   2. Fill in the $real hash table with the actual secret values you obtained.
#   3. Run the script from the repository root:
#        pwsh scripts\replace-secrets.ps1
#   4. The script will rewrite the .env file in‑place (creates a backup .env.bak).
# ---------------------------------------------------------------

# Path to the .env file (repo root)
$envPath = Resolve-Path -Path (Join-Path $PSScriptRoot "..\..")
# The above resolves to the repository root; adjust if the script location changes.

# Define a hash table with real secret values. Replace "YOUR_VALUE" with the actual secret.
$real = @{
    # SSH keys (optional – keep empty if not stored in .env)
    "SSH_KEY_PATH" = "YOUR_SSH_KEY_PATH"
    "SSH_PUBLIC_KEY_PATH" = "YOUR_SSH_PUBLIC_KEY_PATH"
    "GITHUB_ACTIONS_SSH_KEY" = "YOUR_GITHUB_ACTIONS_SSH_PRIVATE_KEY"
    "GITHUB_ACTIONS_SSH_PUBLIC_KEY" = "YOUR_GITHUB_ACTIONS_SSH_PUBLIC_KEY"

    # KiloCode & third‑party API keys
    "KILOCODE_API_KEY" = "YOUR_KILOCODE_API_KEY"
    "KILOCODE_POSTHOG_API_KEY" = "YOUR_POSTHOG_API_KEY"
    "GEMINI_API_KEY" = "YOUR_GEMINI_API_KEY"
    "OLLAMA_API_KEY" = "YOUR_OLLAMA_API_KEY"
    "OPENCODE_API_KEY" = "YOUR_OPENCODE_API_KEY"
    "GITHUB_TOKEN" = "YOUR_GITHUB_TOKEN"
    "GITHUB_API_KEY" = "YOUR_GITHUB_API_KEY"
    "OPENROUTER_API_KEY" = "YOUR_OPENROUTER_API_KEY"
    "DEEPSEEK_API_KEY" = "YOUR_DEEPSEEK_API_KEY"
    "NVIDIA_API_KEY" = "YOUR_NVIDIA_API_KEY"
    "OPENAI_API_KEY" = "YOUR_OPENAI_API_KEY"

    # Saleor/Django secrets
    "SECRET_KEY" = "YOUR_DJANGO_SECRET_KEY"
    "DATABASE_PASSWORD" = "YOUR_DATABASE_PASSWORD"
    "REDIS_URL" = "redis://YOUR_REDIS_HOST:6379/0"
    "STRIPE_PUBLIC_KEY" = "YOUR_STRIPE_PUBLIC_KEY"
    "STRIPE_SECRET_KEY" = "YOUR_STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET" = "YOUR_STRIPE_WEBHOOK_SECRET"
    "EMAIL_HOST_PASSWORD" = "YOUR_SMTP_PASSWORD"
    "BASELINKER_API_KEY" = "YOUR_BASELINKER_API_KEY"
    "GIT_API_GRAINED_TOKEN" = "YOUR_GIT_API_TOKEN"
}

# Backup current .env
Copy-Item -Path $envPath -Destination "${envPath}.bak" -Force

# Read all lines
$lines = Get-Content -Path $envPath

$updatedLines = $lines | ForEach-Object {
    $line = $_
    foreach($key in $real.Keys) {
        if ($line -match "^(export\s+)?$key=\"?.*\"?$") {
            $newVal = $real[$key]
            if ($line -match "^(export\s+)") {
                $prefix = $Matches[1]
                return "${prefix}${key}=\"${newVal}\""
            } else {
                return "${key}=\"${newVal}\""
            }
        }
    }
    return $line
}

# Write back to file
Set-Content -Path $envPath -Value $updatedLines -Encoding UTF8

Write-Host "✅ .env placeholders have been replaced. A backup is saved as .env.bak"