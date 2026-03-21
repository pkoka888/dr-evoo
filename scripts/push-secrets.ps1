# PowerShell script to push .env values to GitHub repository secrets
$envFile = ".env"
$repo = "pkoka888/dr-evo"
$token = (Get-Content $envFile | Where-Object { $_ -match '^GIT_API_GRAINED_TOKEN=' }) -replace '^GIT_API_GRAINED_TOKEN=', ''
$token = $token -replace '^"|"$', ''

if (-not $token) {
    Write-Error "Could not find GIT_API_GRAINED_TOKEN in .env file"
    exit 1
}

# Set the token for gh
$env:GITHUB_TOKEN = $token

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    
    # Skip empty lines and comments
    if (-not $line -or $line -match '^#') { return }
    
    # Parse key=value
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1]
        $value = $matches[2] -replace '^"|"$', ''
        
        # Skip placeholders
        if ($value -match '(define/verify|your-|<REDACTED>|YOUR_).*') {
            Write-Host "Skipping placeholder for $key"
            return
        }
        
        # Validate secret name (only alphanumeric and underscores, start with letter or underscore)
        if ($key -notmatch '^[A-Za-z_][A-Za-z0-9_]*$') {
            Write-Host "Skipping invalid secret name $key"
            return
        }
        
        # Skip GitHub reserved secrets
        if ($key -match '^GITHUB_') {
            Write-Host "Skipping GitHub-reserved secret $key"
            return
        }
        
        Write-Host "Setting secret $key"
        gh secret set $key -b $value --repo $repo
    }
}

Write-Host "Done!"
