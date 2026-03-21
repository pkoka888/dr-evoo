---
name: deployment
description: Toolkit for handling deployment tasks including deploying applications to various platforms, managing deployments, and rollback procedures. Use when users need to deploy code to production, staging, or development environments.
license: MIT
metadata:
  category: operations
  source:
    repository: https://github.com/okamih/kilo-code-skills
    path: deployment
---

# Deployment

Handle deployment tasks for applications to various environments and platforms.

## What I Can Do

- **Deploy web applications** to various platforms (Vercel, Netlify, shared hosting, etc.)
- **Manage deployment workflows** including build, test, and deploy pipelines
- **Execute deployment commands** using npm, git, or platform-specific CLIs
- **Handle database migrations** as part of deployment process
- **Rollback deployments** when issues are detected
- **Configure environment variables** for different deployment environments
- **Deploy PHP applications** to web servers
- **Deploy static sites** and single-page applications

## Limitations

- Cannot access external deployment platforms without proper credentials configured
- Cannot deploy to production without explicit user confirmation
- Cannot manage cloud infrastructure (AWS, GCP, Azure) without appropriate access
- Deployment speed depends on network conditions and build complexity

## Common Commands and Tools

### NPM-based Deployments
```bash
npm run build
npm run deploy
vercel deploy --prod
netlify deploy --prod
```

### PHP Deployments
```bash
# Deploy via FTP/SFTP
# Run composer install
composer install --no-dev --optimize-autoloader

# Clear caches
php artisan cache:clear
php artisan config:cache
php artisan route:cache
```

### Git-based Deployments
```bash
git push origin main
git push production main
```

### Docker Deployments
```bash
docker build -t app:latest .
docker push app:latest
docker-compose up -d
```

## Best Practices

1. Always verify the deployment target and environment before proceeding
2. Run build/tests locally before deploying to catch errors early
3. Use staging/development environments first when available
4. Confirm with user before production deployments
5. Keep deployment logs for debugging deployment issues
