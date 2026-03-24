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
exports.getFileMetadataTool = void 0;
const zod_1 = require("zod");
const fs = __importStar(require("fs"));
const security_js_1 = require("../utils/security.js");
const logger_js_1 = require("../utils/logger.js");
exports.getFileMetadataTool = {
    name: "get_file_metadata",
    description: "Get metadata information for a file or directory",
    schema: {
        path: zod_1.z.string().describe("Path to the file or directory")
    },
    handler: async ({ path }) => {
        try {
            logger_js_1.logger.info(`Getting metadata for: ${path}`);
            // Validate path
            const validatedPath = (0, security_js_1.validatePath)(path);
            // Get file stats
            const stats = fs.statSync(validatedPath);
            const metadata = {
                path: validatedPath,
                type: stats.isDirectory() ? 'directory' : 'file',
                size: stats.size,
                created: stats.birthtime.toISOString(),
                modified: stats.mtime.toISOString(),
                accessed: stats.atime.toISOString(),
                permissions: stats.mode.toString(8),
                isReadable: true, // We already validated access
                isWritable: false, // Read-only for security
                isExecutable: !!(stats.mode & parseInt('111', 8))
            };
            logger_js_1.logger.info(`Retrieved metadata for: ${path}`);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify(metadata, null, 2)
                    }]
            };
        }
        catch (error) {
            logger_js_1.logger.error(`Error getting metadata for ${path}`, error);
            if (error instanceof security_js_1.SecurityError) {
                throw error;
            }
            throw new Error(`Failed to get metadata: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=getFileMetadata.js.map