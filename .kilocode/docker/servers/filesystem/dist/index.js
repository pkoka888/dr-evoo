#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_1 = require("zod");
const http = __importStar(require("http"));
// Import tools
const readFile_js_1 = require("./tools/readFile.js");
const listDirectory_js_1 = require("./tools/listDirectory.js");
const getFileMetadata_js_1 = require("./tools/getFileMetadata.js");
const searchFiles_js_1 = require("./tools/searchFiles.js");
// Import utilities
const logger_js_1 = require("./utils/logger.js");
const tools = [
    readFile_js_1.readFileTool,
    listDirectory_js_1.listDirectoryTool,
    getFileMetadata_js_1.getFileMetadataTool,
    searchFiles_js_1.searchFilesTool,
];
async function main() {
    try {
        // Start health check server
        const healthPort = parseInt(process.env["HEALTH_PORT"] || "3101");
        const healthServer = http.createServer((req, res) => {
            if (req.url === "/health") {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    status: "healthy",
                    timestamp: new Date().toISOString(),
                    service: "filesystem-mcp-server",
                }));
            }
            else {
                res.writeHead(404);
                res.end();
            }
        });
        healthServer.on("error", (err) => {
            if (err.code === "EADDRINUSE") {
                logger_js_1.logger.warn(`Health port ${healthPort} in use, skipping health server`);
            }
            else {
                logger_js_1.logger.error("Health server error", err);
            }
        });
        healthServer.listen(healthPort, "0.0.0.0", () => {
            logger_js_1.logger.info(`Health check server listening on port ${healthPort}`);
        });
        // Initialize MCP server
        const server = new index_js_1.Server({
            name: "filesystem-server",
            version: "1.0.0",
        });
        // Register tools list handler
        server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            return {
                tools: tools.map((tool) => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: zod_1.z.object(tool.schema).shape,
                })),
            };
        });
        // Register tool call handler
        server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const tool = tools.find((t) => t.name === request.params.name);
            if (!tool) {
                throw new Error(`Unknown tool: ${request.params.name}`);
            }
            const toolSchema = zod_1.z.object(tool.schema);
            const parsedArgs = toolSchema.parse(request.params.arguments);
            const result = await tool.handler(parsedArgs);
            return result;
        });
        // Set up stdio transport
        const transport = new stdio_js_1.StdioServerTransport();
        logger_js_1.logger.info("Filesystem MCP server starting...");
        await server.connect(transport);
        logger_js_1.logger.info("Filesystem MCP server connected and ready");
    }
    catch (error) {
        logger_js_1.logger.error("Failed to start filesystem MCP server", error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on("SIGINT", () => {
    logger_js_1.logger.info("Received SIGINT, shutting down gracefully");
    process.exit(0);
});
process.on("SIGTERM", () => {
    logger_js_1.logger.info("Received SIGTERM, shutting down gracefully");
    process.exit(0);
});
main().catch((error) => {
    logger_js_1.logger.error("Unhandled error in main", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map