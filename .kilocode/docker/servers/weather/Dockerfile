# Use the base MCP image
FROM node:18-alpine

# Install additional tools needed for HTTP requests
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S mcp && adduser -S mcp -u 1001

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create data directory
RUN mkdir -p /app/data && chown -R mcp:mcp /app

# Switch to non-root user
USER mcp

# Expose health check port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Set health port environment variable
ENV HEALTH_PORT=3000

# Set environment variables
ENV NODE_ENV=production

# Start the server
CMD ["node", "dist/index.js"]