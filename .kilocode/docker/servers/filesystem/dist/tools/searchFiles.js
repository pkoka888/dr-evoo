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
exports.searchFilesTool = void 0;
const zod_1 = require("zod");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const security_js_1 = require("../utils/security.js");
const logger_js_1 = require("../utils/logger.js");
exports.searchFilesTool = {
    name: "search_files",
    description: "Search for files and directories by name pattern",
    schema: {
        directory: zod_1.z.string().describe("Root directory to search in"),
        pattern: zod_1.z.string().describe("Search pattern (supports * and ? wildcards)"),
        maxResults: zod_1.z.number().optional().describe("Maximum number of results to return")
    },
    handler: async ({ directory, pattern, maxResults = 100 }) => {
        try {
            logger_js_1.logger.info(`Searching in ${directory} for pattern: ${pattern}`);
            // Validate directory path
            const validatedDir = (0, security_js_1.validatePath)(directory);
            if (!(0, security_js_1.isDirectory)(validatedDir)) {
                throw new security_js_1.SecurityError(`Path is not a directory: ${directory}`, 'NOT_A_DIRECTORY');
            }
            // Convert pattern to regex
            const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
            const results = [];
            // Recursive search function
            function searchRecursive(currentPath) {
                if (results.length >= maxResults)
                    return;
                try {
                    const items = fs.readdirSync(currentPath);
                    for (const item of items) {
                        if (results.length >= maxResults)
                            return;
                        const fullPath = path.join(currentPath, item);
                        // Validate each path for security
                        try {
                            (0, security_js_1.validatePath)(fullPath);
                        }
                        catch {
                            // Skip invalid paths
                            continue;
                        }
                        const stats = fs.statSync(fullPath);
                        const relativePath = path.relative(validatedDir, fullPath);
                        if (regex.test(item) || regex.test(relativePath)) {
                            results.push({
                                path: relativePath,
                                type: stats.isDirectory() ? 'directory' : 'file',
                                size: stats.size
                            });
                        }
                        // Recurse into directories
                        if (stats.isDirectory()) {
                            searchRecursive(fullPath);
                        }
                    }
                }
                catch (error) {
                    // Skip directories we can't read
                    logger_js_1.logger.debug(`Skipping unreadable directory: ${currentPath}`);
                }
            }
            searchRecursive(validatedDir);
            logger_js_1.logger.info(`Search completed, found ${results.length} matches`);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify(results, null, 2)
                    }]
            };
        }
        catch (error) {
            logger_js_1.logger.error(`Error searching in ${directory} for ${pattern}`, error);
            if (error instanceof security_js_1.SecurityError) {
                throw error;
            }
            throw new Error(`Failed to search files: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=searchFiles.js.map