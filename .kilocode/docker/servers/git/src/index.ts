#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    ListToolsRequestSchema,
    CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as http from "http";

// Import tools
import { getCommitHistoryTool } from "./tools/getCommitHistory.js";
import { getBranchesTool } from "./tools/getBranches.js";
import { getDiffTool } from "./tools/getDiff.js";
import { createBranchTool } from "./tools/createBranch.js";
import { switchBranchTool } from "./tools/switchBranch.js";

// Import utilities
import { logger } from "./utils/logger.js";

const tools = [
    getCommitHistoryTool,
    getBranchesTool,
    getDiffTool,
    createBranchTool,
    switchBranchTool,
];

async function main() {
    try {
        // Start health check server
        const healthPort = parseInt(process.env["HEALTH_PORT"] || "3102");
        const healthServer = http.createServer((req, res) => {
            if (req.url === "/health") {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(
                    JSON.stringify({
                        status: "healthy",
                        timestamp: new Date().toISOString(),
                        service: "git-mcp-server",
                    }),
                );
            } else {
                res.writeHead(404);
                res.end();
            }
        });

        healthServer.on("error", (err: NodeJS.ErrnoException) => {
            if (err.code === "EADDRINUSE") {
                logger.warn(
                    `Health port ${healthPort} in use, skipping health server`,
                );
            } else {
                logger.error("Health server error", err);
            }
        });

        healthServer.listen(healthPort, "0.0.0.0", () => {
            logger.info(`Health check server listening on port ${healthPort}`);
        });

        // Initialize MCP server
        const server = new Server({
            name: "git-server",
            version: "1.0.0",
        });

        // Register tools list handler
        server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: tools.map((tool) => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: z.object(tool.schema).shape,
                })),
            };
        });

        // Register tool call handler
        server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const tool = tools.find((t) => t.name === request.params.name);
            if (!tool) {
                throw new Error(`Unknown tool: ${request.params.name}`);
            }

            const toolSchema = z.object(tool.schema);
            const parsedArgs = toolSchema.parse(request.params.arguments);
            const result = await (
                tool.handler as (
                    args: z.infer<typeof toolSchema>,
                ) => Promise<{ content: Array<{ type: string; text: string }> }>
            )(parsedArgs);
            return result;
        });

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
process.on("SIGINT", () => {
    logger.info("Received SIGINT, shutting down gracefully");
    process.exit(0);
});

process.on("SIGTERM", () => {
    logger.info("Received SIGTERM, shutting down gracefully");
    process.exit(0);
});

main().catch((error) => {
    logger.error("Unhandled error in main", error);
    process.exit(1);
});
