#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as http from 'http';

// Import tools
import { getCommitHistoryTool } from "./tools/getCommitHistory.js";
import { getBranchesTool } from "./tools/getBranches.js";
import { getDiffTool } from "./tools/getDiff.js";
import { createBranchTool } from "./tools/createBranch.js";
import { switchBranchTool } from "./tools/switchBranch.js";

// Import utilities
import { logger } from "./utils/logger.js";

async function main() {
  try {
    // Start health check server
    const healthPort = parseInt(process.env.HEALTH_PORT || '3002');
    const healthServer = http.createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'git-mcp-server'
        }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    healthServer.listen(healthPort, '0.0.0.0', () => {
      logger.info(`Health check server listening on port ${healthPort}`);
    });

    // Initialize MCP server
    const server = new McpServer({
      name: "git-server",
      version: "1.0.0",
      description: "Secure git repository operations for MCP"
    });

    // Register tools
    server.tool(getCommitHistoryTool.name, getCommitHistoryTool.schema, getCommitHistoryTool.handler);
    server.tool(getBranchesTool.name, getBranchesTool.schema, getBranchesTool.handler);
    server.tool(getDiffTool.name, getDiffTool.schema, getDiffTool.handler);
    server.tool(createBranchTool.name, createBranchTool.schema, createBranchTool.handler);
    server.tool(switchBranchTool.name, switchBranchTool.schema, switchBranchTool.handler);

    // Set up stdio transport
    const transport = new StdioServerTransport();

    logger.info("Git MCP server starting...");
    await server.connect(transport);
    logger.info("Git MCP server connected and ready");

  } catch (error) {
    logger.error("Failed to start git MCP server", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info("Received SIGINT, shutting down gracefully");
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info("Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

main().catch((error) => {
  logger.error("Unhandled error in main", error);
  process.exit(1);
});