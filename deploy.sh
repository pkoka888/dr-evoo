#!/bin/bash
set -e

echo "🚀 Starting Deployment to Debian 13..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 1. Build the production images
echo "📦 Building Docker images..."
docker compose -f docker-compose.prod.yml build

# 2. Bring up the Database and Redis first
echo "🐘 Starting dependencies..."
docker compose -f docker-compose.prod.yml up -d db redis

# 3. Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL 17 to be healthy..."
until [ "$(docker inspect -f '{{.State.Health.Status}}' $(docker compose -f docker-compose.prod.yml ps -q db))" == "healthy" ]; do
    printf '.'
    sleep 2
done

# 4. Run Migrations
echo "🏗️  Running Database Migrations..."
docker compose -f docker-compose.prod.yml run --rm api python manage.py migrate --noinput

# 5. Clear Redis cache after migrations
echo "🧹 Clearing Redis cache..."
docker compose -f docker-compose.prod.yml exec -T redis redis-cli FLUSHALL

# 6. Collect Static Files
echo "🎨 Collecting Static Files..."
docker compose -f docker-compose.prod.yml run --rm api python manage.py collectstatic --noinput

# 7. Stop old worker if running
echo "🛑 Stopping old worker..."
docker compose -f docker-compose.prod.yml stop worker || true

# 8. Start all services
echo "✨ Starting all services..."
docker compose -f docker-compose.prod.yml up -d

# 9. Start worker separately for better logging
echo "🚀 Starting worker..."
docker compose -f docker-compose.prod.yml up -d worker

echo "✅ Deployment Successful!"
echo ""
echo "Services running:"
echo "  - API: https://api.yourdomain.cz"
echo "  - Dashboard: https://dashboard.yourdomain.cz"
echo "  - Storefront: https://shop.yourdomain.cz"
