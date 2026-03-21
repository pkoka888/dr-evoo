FROM node:18-alpine

# Install logging and monitoring utilities
RUN apk add --no-cache git curl logrotate rsyslog jq

# Create log directories
RUN mkdir -p /app/logs /var/log/mcp && chown -R mcp:mcp /app /var/log/mcp

# Create non-root user for security
RUN addgroup -g 1001 -S mcp && adduser -S mcp -u 1001

# Switch to non-root user
USER mcp

WORKDIR /app

# Create log rotation configuration
RUN echo '/app/logs/*.log {\n\
    daily\n\
    rotate 7\n\
    compress\n\
    missingok\n\
    notifempty\n\
    create 0644 mcp mcp\n\
}' > /app/logrotate.conf

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1