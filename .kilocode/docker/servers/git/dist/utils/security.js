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
exports.GitSecurityError = exports.DEFAULT_GIT_SECURITY_CONFIG = void 0;
exports.validateGitPath = validateGitPath;
exports.validateGitOperation = validateGitOperation;
exports.isGitRepository = isGitRepository;
exports.sanitizePath = sanitizePath;
exports.validateCommitLimit = validateCommitLimit;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const logger_js_1 = require("./logger.js");
exports.DEFAULT_GIT_SECURITY_CONFIG = {
    allowedRootDirectories: ['/app/workspace'],
    blockedPaths: ['/etc', '/proc', '/sys', '/dev', '/root', '/home'],
    allowedOperations: [
        'status', 'log', 'show', 'diff', 'branch', 'checkout', 'merge', 'pull',
        'fetch', 'add', 'commit', 'stash', 'tag', 'blame', 'rev-parse'
    ],
    maxCommitsLimit: 1000
};
class GitSecurityError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'GitSecurityError';
    }
}
exports.GitSecurityError = GitSecurityError;
/**
 * Validates a git repository path for security constraints
 */
function validateGitPath(repoPath, config = exports.DEFAULT_GIT_SECURITY_CONFIG) {
    if (!repoPath || typeof repoPath !== 'string') {
        throw new GitSecurityError('Invalid repository path: path must be a non-empty string', 'INVALID_PATH');
    }
    // Resolve the path to prevent relative path tricks
    const resolvedPath = path.resolve(repoPath);
    // Check for path traversal attempts
    if (resolvedPath !== path.normalize(resolvedPath)) {
        throw new GitSecurityError('Path traversal detected', 'PATH_TRAVERSAL');
    }
    // Check for suspicious sequences
    if (resolvedPath.includes('..') || resolvedPath.includes('\0')) {
        throw new GitSecurityError('Suspicious path characters detected', 'SUSPICIOUS_PATH');
    }
    // Check against blocked paths
    for (const blockedPath of config.blockedPaths) {
        if (resolvedPath.startsWith(blockedPath)) {
            throw new GitSecurityError(`Access to ${blockedPath} is blocked`, 'BLOCKED_PATH');
        }
    }
    // Check if path is within allowed root directories
    const isAllowed = config.allowedRootDirectories.some(rootDir => {
        return resolvedPath.startsWith(rootDir) || path.relative(rootDir, resolvedPath).startsWith('..') === false;
    });
    if (!isAllowed) {
        throw new GitSecurityError('Repository path is outside allowed directories', 'UNAUTHORIZED_PATH');
    }
    return resolvedPath;
}
/**
 * Validates if a git operation is allowed
 */
function validateGitOperation(operation, config = exports.DEFAULT_GIT_SECURITY_CONFIG) {
    if (!config.allowedOperations.includes(operation)) {
        throw new GitSecurityError(`Git operation '${operation}' is not allowed`, 'OPERATION_NOT_ALLOWED');
    }
}
/**
 * Checks if a path is a valid git repository
 */
function isGitRepository(repoPath) {
    try {
        const gitDir = path.join(repoPath, '.git');
        return fs.existsSync(gitDir) && fs.statSync(gitDir).isDirectory();
    }
    catch {
        return false;
    }
}
/**
 * Sanitizes a path string
 */
function sanitizePath(input) {
    return input.replace(/[\0\n\r\t]/g, '').trim();
}
/**
 * Validates commit limit
 */
function validateCommitLimit(limit, config = exports.DEFAULT_GIT_SECURITY_CONFIG) {
    if (limit > config.maxCommitsLimit) {
        logger_js_1.logger.warn(`Requested commit limit ${limit} exceeds maximum ${config.maxCommitsLimit}, limiting to ${config.maxCommitsLimit}`);
        return config.maxCommitsLimit;
    }
    return limit;
}
//# sourceMappingURL=security.js.map