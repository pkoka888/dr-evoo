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
exports.SecurityError = exports.DEFAULT_SECURITY_CONFIG = void 0;
exports.validatePath = validatePath;
exports.validateFileSize = validateFileSize;
exports.sanitizePath = sanitizePath;
exports.pathExists = pathExists;
exports.isDirectory = isDirectory;
exports.isFile = isFile;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
exports.DEFAULT_SECURITY_CONFIG = {
    allowedRootDirectories: process.env['ALLOWED_DIRS']
        ? process.env['ALLOWED_DIRS'].split(",").map(d => path.resolve(d))
        : [path.resolve("/app/workspace"), process.cwd()], // Docker: /app/workspace, Local: cwd
    maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedFileExtensions: [
        ".txt",
        ".md",
        ".json",
        ".js",
        ".ts",
        ".py",
        ".html",
        ".css",
        ".xml",
        ".yaml",
        ".yml",
    ],
    blockedPaths: ["/etc", "/proc", "/sys", "/dev", "/root", "/home"],
};
class SecurityError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = "SecurityError";
    }
}
exports.SecurityError = SecurityError;
/**
 * Validates a file path for security constraints
 */
function validatePath(filePath, config = exports.DEFAULT_SECURITY_CONFIG) {
    if (!filePath || typeof filePath !== "string") {
        throw new SecurityError("Invalid path: path must be a non-empty string", "INVALID_PATH");
    }
    // Resolve the path to prevent relative path tricks
    const resolvedPath = path.resolve(filePath);
    // Check for path traversal attempts
    if (resolvedPath !== path.normalize(resolvedPath)) {
        throw new SecurityError("Path traversal detected", "PATH_TRAVERSAL");
    }
    // Check if path contains suspicious sequences
    if (resolvedPath.includes("..") || resolvedPath.includes("\0")) {
        throw new SecurityError("Suspicious path characters detected", "SUSPICIOUS_PATH");
    }
    // Check against blocked paths
    for (const blockedPath of config.blockedPaths) {
        if (resolvedPath.startsWith(blockedPath)) {
            throw new SecurityError(`Access to ${blockedPath} is blocked`, "BLOCKED_PATH");
        }
    }
    // Check if path is within allowed root directories
    const isAllowed = config.allowedRootDirectories.some((rootDir) => {
        return (resolvedPath.startsWith(rootDir) ||
            path.relative(rootDir, resolvedPath).startsWith("..") === false);
    });
    if (!isAllowed) {
        throw new SecurityError("Path is outside allowed directories", "UNAUTHORIZED_PATH");
    }
    // Check file extension if specified
    if (config.allowedFileExtensions.length > 0) {
        const ext = path.extname(resolvedPath).toLowerCase();
        if (ext && !config.allowedFileExtensions.includes(ext)) {
            throw new SecurityError(`File extension ${ext} is not allowed`, "INVALID_EXTENSION");
        }
    }
    return resolvedPath;
}
/**
 * Validates file size before reading
 */
function validateFileSize(filePath, config = exports.DEFAULT_SECURITY_CONFIG) {
    try {
        const stats = fs.statSync(filePath);
        if (stats.size > config.maxFileSizeBytes) {
            throw new SecurityError(`File size ${stats.size} bytes exceeds maximum allowed size ${config.maxFileSizeBytes} bytes`, "FILE_TOO_LARGE");
        }
    }
    catch (error) {
        if (error instanceof SecurityError) {
            throw error;
        }
        throw new SecurityError(`Cannot access file: ${error instanceof Error ? error.message : String(error)}`, "FILE_ACCESS_ERROR");
    }
}
/**
 * Sanitizes a path string
 */
function sanitizePath(input) {
    return input.replace(/[\0\n\r\t]/g, "").trim();
}
/**
 * Checks if a path exists and is accessible
 */
function pathExists(filePath) {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Checks if a path is a directory
 */
function isDirectory(filePath) {
    try {
        return fs.statSync(filePath).isDirectory();
    }
    catch {
        return false;
    }
}
/**
 * Checks if a path is a file
 */
function isFile(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=security.js.map