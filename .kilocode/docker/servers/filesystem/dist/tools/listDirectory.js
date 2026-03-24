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
exports.listDirectoryTool = void 0;
const zod_1 = require("zod");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const security_js_1 = require("../utils/security.js");
const logger_js_1 = require("../utils/logger.js");
exports.listDirectoryTool = {
    name: "list_directory",
    description: "List contents of a directory with optional filtering",
    schema: {
        path: zod_1.z.string().describe("Path to the directory to list"),
        pattern: zod_1.z.string().optional().describe("Optional glob pattern to filter results")
    },
    handler: async ({ path: dirPath, pattern }) => {
        try {
            logger_js_1.logger.info(`Listing directory: ${dirPath}`);
            // Validate path
            const validatedPath = (0, security_js_1.validatePath)(dirPath);
            // Check if path is a directory
            if (!(0, security_js_1.isDirectory)(validatedPath)) {
                throw new security_js_1.SecurityError(`Path is not a directory: ${dirPath}`, 'NOT_A_DIRECTORY');
            }
            // Read directory contents
            const items = fs.readdirSync(validatedPath);
            // Apply pattern filtering if provided
            let filteredItems = items;
            if (pattern) {
                // Simple pattern matching (could be enhanced with glob library)
                const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
                filteredItems = items.filter(item => regex.test(item));
            }
            // Get detailed information for each item
            const result = filteredItems.map(item => {
                const fullPath = path.join(validatedPath, item);
                const stats = fs.statSync(fullPath);
                return {
                    name: item,
                    type: stats.isDirectory() ? 'directory' : 'file',
                    size: stats.size,
                    modified: stats.mtime.toISOString()
                };
            });
            logger_js_1.logger.info(`Listed ${result.length} items in directory: ${dirPath}`);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }]
            };
        }
        catch (error) {
            logger_js_1.logger.error(`Error listing directory ${dirPath}`, error);
            if (error instanceof security_js_1.SecurityError) {
                throw error;
            }
            throw new Error(`Failed to list directory: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=listDirectory.js.map