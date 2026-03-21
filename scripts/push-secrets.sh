#!/usr/bin/env bash
# Push .env values to GitHub repository secrets using the GIT_API_GRAINED_TOKEN
set -euo pipefail
# Add GitHub CLI to PATH on Windows
export PATH="/c/Program Files/GitHub CLI:$PATH"
# Extract GIT_API_GRAINED_TOKEN from .env
GIT_API_GRAINED_TOKEN=$(grep '^GIT_API_GRAINED_TOKEN=' .env | cut -d'=' -f2-)
REPO="pkoka888/dr-evo"
while IFS= read -r line; do
  # Trim whitespace
  line=$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
  [[ -z "$line" ]] && continue
  [[ "$line" == \#* ]] && continue
  if [[ "$line" =~ ^export[[:space:]]+([^=]+)=(.*)$ ]]; then
    key="${BASH_REMATCH[1]}"
    value="${BASH_REMATCH[2]}"
  elif [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
    key="${BASH_REMATCH[1]}"
    value="${BASH_REMATCH[2]}"
  else
    continue
  fi
  # Strip surrounding quotes
  value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//')
  # Skip placeholder values (define/verify, your-, <REDACTED>, YOUR_)
  if [[ "$value" =~ (define/verify|your-|<REDACTED>|YOUR_).* ]]; then
    echo "Skipping placeholder for $key"
    continue
  fi
  # Validate secret name (only alphanumeric and underscores, start with letter or underscore)
  if [[ ! "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
    echo "Skipping invalid secret name $key"
    continue
  fi
  # GitHub disallows secrets starting with GITHUB_
  if [[ "$key" =~ ^GITHUB_ ]]; then
    echo "Skipping GitHub-reserved secret $key"
    continue
  fi
  echo "Setting secret $key"
  cmd /c "set GITHUB_TOKEN=$GIT_API_GRAINED_TOKEN && gh secret set $key -b $value --repo $REPO"
done < .env