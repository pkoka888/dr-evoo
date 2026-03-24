"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchesTool = void 0;
const zod_1 = require("zod");
const simple_git_1 = __importDefault(require("simple-git"));
const security_js_1 = require("../utils/security.js");
const logger_js_1 = require("../utils/logger.js");
exports.getBranchesTool = {
    name: "get_branches",
    description: "Get list of branches in a git repository",
    schema: {
        repoPath: zod_1.z.string().describe("Path to the git repository"),
        all: zod_1.z
            .boolean()
            .optional()
            .describe("Include remote branches (default: false)"),
    },
    handler: async ({ repoPath, all = false, }) => {
        try {
            logger_js_1.logger.info(`Getting branches for repo: ${repoPath}, all: ${all}`);
            // Validate repository path
            const validatedPath = (0, security_js_1.validateGitPath)(repoPath);
            // Check if it's a git repository
            if (!(0, security_js_1.isGitRepository)(validatedPath)) {
                throw new security_js_1.GitSecurityError(`Path is not a git repository: ${repoPath}`, "NOT_GIT_REPO");
            }
            // Initialize git
            const git = (0, simple_git_1.default)(validatedPath);
            // Get branches
            const branchSummary = await git.branch(all ? ["-a"] : []);
            const branches = {
                current: branchSummary.current,
                local: Object.entries(branchSummary.branches || {})
                    .filter(([name]) => !name.includes("remotes/"))
                    .map(([, branch]) => ({
                    name: branch.name,
                    commit: branch.commit,
                    label: branch.label,
                })),
                remote: all
                    ? Object.entries(branchSummary.branches || {})
                        .filter(([name]) => name.includes("remotes/"))
                        .map(([name, branch]) => ({
                        name: name.replace("remotes/", ""),
                        commit: branch.commit,
                        label: branch.label,
                    }))
                    : [],
            };
            logger_js_1.logger.info(`Retrieved branches from ${repoPath}: ${branches.local.length} local, ${branches.remote.length} remote`);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            repository: validatedPath,
                            current: branches.current,
                            branches: branches,
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            logger_js_1.logger.error(`Error getting branches for ${repoPath}`, error);
            if (error instanceof security_js_1.GitSecurityError) {
                throw error;
            }
            throw new Error(`Failed to get branches: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
};
//# sourceMappingURL=getBranches.js.map