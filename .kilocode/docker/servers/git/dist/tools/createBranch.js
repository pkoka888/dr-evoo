"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBranchTool = void 0;
const zod_1 = require("zod");
const simple_git_1 = __importDefault(require("simple-git"));
const security_js_1 = require("../utils/security.js");
const logger_js_1 = require("../utils/logger.js");
exports.createBranchTool = {
    name: "create_branch",
    description: "Create a new branch in a git repository",
    schema: {
        repoPath: zod_1.z.string().describe("Path to the git repository"),
        branchName: zod_1.z.string().describe("Name of the new branch"),
        startPoint: zod_1.z.string().optional().describe("Starting point (commit, branch, or tag) - default: current HEAD")
    },
    handler: async ({ repoPath, branchName, startPoint }) => {
        try {
            logger_js_1.logger.info(`Creating branch ${branchName} in repo: ${repoPath}, startPoint: ${startPoint}`);
            // Validate operation
            (0, security_js_1.validateGitOperation)('branch');
            // Validate repository path
            const validatedPath = (0, security_js_1.validateGitPath)(repoPath);
            // Check if it's a git repository
            if (!(0, security_js_1.isGitRepository)(validatedPath)) {
                throw new security_js_1.GitSecurityError(`Path is not a git repository: ${repoPath}`, 'NOT_GIT_REPO');
            }
            // Initialize git
            const git = (0, simple_git_1.default)(validatedPath);
            // Create branch
            await git.checkoutBranch(branchName, startPoint || 'HEAD');
            logger_js_1.logger.info(`Successfully created and switched to branch: ${branchName}`);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            repository: validatedPath,
                            action: "created_branch",
                            branch: branchName,
                            startPoint: startPoint || 'HEAD',
                            success: true
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            logger_js_1.logger.error(`Error creating branch ${branchName} in ${repoPath}`, error);
            if (error instanceof security_js_1.GitSecurityError) {
                throw error;
            }
            throw new Error(`Failed to create branch: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=createBranch.js.map