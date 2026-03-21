# Use the base MCP image
FROM node:18-alpine

# Install additional tools needed for file operations
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

# Create workspace directory
RUN mkdir -p /app/workspace && chown -R mcp:mcp /app

# Switch to non-root user
USER mcp

# Expose health check port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Set health port environment variable
ENV HEALTH_PORT=3001

# Set environment variables
ENV NODE_ENV=production
ENV WORKSPACE_PATH=/app/workspace

# Start the server
CMD ["node", "dist/index.js"]