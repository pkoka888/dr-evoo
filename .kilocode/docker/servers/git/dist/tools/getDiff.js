"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiffTool = void 0;
const zod_1 = require("zod");
const simple_git_1 = __importDefault(require("simple-git"));
const security_js_1 = require("../utils/security.js");
const logger_js_1 = require("../utils/logger.js");
exports.getDiffTool = {
    name: "get_diff",
    description: "Get diff between commits, branches, or working directory",
    schema: {
        repoPath: zod_1.z.string().describe("Path to the git repository"),
        from: zod_1.z.string().optional().describe("Source commit/branch/tag (default: HEAD~1)"),
        to: zod_1.z.string().optional().describe("Target commit/branch/tag (default: working directory)"),
        filePath: zod_1.z.string().optional().describe("Specific file path to diff"),
        cached: zod_1.z.boolean().optional().describe("Compare staged changes instead of working directory (default: false)")
    },
    handler: async ({ repoPath, from, to, filePath, cached = false }) => {
        try {
            logger_js_1.logger.info(`Getting diff for repo: ${repoPath}, from: ${from}, to: ${to}, file: ${filePath}`);
            // Validate repository path
            const validatedPath = (0, security_js_1.validateGitPath)(repoPath);
            // Check if it's a git repository
            if (!(0, security_js_1.isGitRepository)(validatedPath)) {
                throw new security_js_1.GitSecurityError(`Path is not a git repository: ${repoPath}`, 'NOT_GIT_REPO');
            }
            // Initialize git
            const git = (0, simple_git_1.default)(validatedPath);
            // Build diff options
            const diffOptions = [];
            if (cached) {
                diffOptions.push('--cached');
            }
            if (from && to) {
                diffOptions.push(from, to);
            }
            else if (from) {
                diffOptions.push(from);
            }
            if (filePath) {
                diffOptions.push('--', filePath);
            }
            // Get diff
            const diffResult = await git.diff(diffOptions);
            logger_js_1.logger.info(`Retrieved diff from ${repoPath}, length: ${diffResult.length} characters`);
            return {
                content: [{
                        type: "text",
                        text: diffResult || "No differences found"
                    }]
            };
        }
        catch (error) {
            logger_js_1.logger.error(`Error getting diff for ${repoPath}`, error);
            if (error instanceof security_js_1.GitSecurityError) {
                throw error;
            }
            throw new Error(`Failed to get diff: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=getDiff.js.map