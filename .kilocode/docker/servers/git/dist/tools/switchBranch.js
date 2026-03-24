"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchBranchTool = void 0;
const zod_1 = require("zod");
const simple_git_1 = __importDefault(require("simple-git"));
const security_js_1 = require("../utils/security.js");
const logger_js_1 = require("../utils/logger.js");
exports.switchBranchTool = {
    name: "switch_branch",
    description: "Switch to a different branch in a git repository",
    schema: {
        repoPath: zod_1.z.string().describe("Path to the git repository"),
        branchName: zod_1.z.string().describe("Name of the branch to switch to"),
        create: zod_1.z.boolean().optional().describe("Create the branch if it doesn't exist (default: false)")
    },
    handler: async ({ repoPath, branchName, create = false }) => {
        try {
            logger_js_1.logger.info(`Switching to branch ${branchName} in repo: ${repoPath}, create: ${create}`);
            // Validate operation
            (0, security_js_1.validateGitOperation)('checkout');
            // Validate repository path
            const validatedPath = (0, security_js_1.validateGitPath)(repoPath);
            // Check if it's a git repository
            if (!(0, security_js_1.isGitRepository)(validatedPath)) {
                throw new security_js_1.GitSecurityError(`Path is not a git repository: ${repoPath}`, 'NOT_GIT_REPO');
            }
            // Initialize git
            const git = (0, simple_git_1.default)(validatedPath);
            // Switch branch
            if (create) {
                await git.checkoutBranch(branchName, 'HEAD');
            }
            else {
                await git.checkout(branchName);
            }
            logger_js_1.logger.info(`Successfully switched to branch: ${branchName}`);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            repository: validatedPath,
                            action: "switched_branch",
                            branch: branchName,
                            created: create,
                            success: true
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            logger_js_1.logger.error(`Error switching to branch ${branchName} in ${repoPath}`, error);
            if (error instanceof security_js_1.GitSecurityError) {
                throw error;
            }
            throw new Error(`Failed to switch branch: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=switchBranch.js.map