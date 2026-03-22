#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as http from 'http';

// Import tools
import { readFileTool } from "./tools/readFile.js";
import { listDirectoryTool } from "./tools/listDirectory.js";
import { getFileMetadataTool } from "./tools/getFileMetadata.js";
import { searchFilesTool } from "./tools/searchFiles.js";

// Import utilities
import { validatePath } from "./utils/security.js";
import { logger } from "./utils/logger.js";

async function main() {
  try {
    // Start health check server
    const healthPort = parseInt(process.env.HEALTH_PORT || '3101');
    const healthServer = http.createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'filesystem-mcp-server'
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
      name: "filesystem-server",
      version: "1.0.0",
      description: "Secure filesystem operations for MCP"
    });

    // Register tools
    server.tool(readFileTool.name, readFileTool.description, readFileTool.schema, readFileTool.handler);
    server.tool(listDirectoryTool.name, listDirectoryTool.description, listDirectoryTool.schema, listDirectoryTool.handler);
    server.tool(getFileMetadataTool.name, getFileMetadataTool.description, getFileMetadataTool.schema, getFileMetadataTool.handler);
    server.tool(searchFilesTool.name, searchFilesTool.description, searchFilesTool.schema, searchFilesTool.handler);

    // Set up stdio transport
    const transport = new StdioServerTransport();

    logger.info("Filesystem MCP server starting...");
    await server.connect(transport);
    logger.info("Filesystem MCP server connected and ready");

  } catch (error) {
    logger.error("Failed to start filesystem MCP server", error);
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