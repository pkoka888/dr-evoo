"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitHistoryTool = void 0;
const zod_1 = require("zod");
const simple_git_1 = __importDefault(require("simple-git"));
const security_js_1 = require("../utils/security.js");
const logger_js_1 = require("../utils/logger.js");
exports.getCommitHistoryTool = {
    name: "get_commit_history",
    description: "Get commit history for a git repository with security restrictions",
    schema: {
        repoPath: zod_1.z.string().describe("Path to the git repository"),
        limit: zod_1.z.number().min(1).max(1000).optional().describe("Maximum number of commits to retrieve (default: 50)"),
        branch: zod_1.z.string().optional().describe("Branch name to get history from (default: current branch)"),
        since: zod_1.z.string().optional().describe("Only commits after this date (ISO format)"),
        until: zod_1.z.string().optional().describe("Only commits before this date (ISO format)")
    },
    handler: async ({ repoPath, limit = 50, branch, since, until }) => {
        try {
            logger_js_1.logger.info(`Getting commit history for repo: ${repoPath}, limit: ${limit}`);
            // Validate repository path
            const validatedPath = (0, security_js_1.validateGitPath)(repoPath);
            // Check if it's a git repository
            if (!(0, security_js_1.isGitRepository)(validatedPath)) {
                throw new security_js_1.GitSecurityError(`Path is not a git repository: ${repoPath}`, 'NOT_GIT_REPO');
            }
            // Validate commit limit
            const validatedLimit = (0, security_js_1.validateCommitLimit)(limit);
            // Initialize git
            const git = (0, simple_git_1.default)(validatedPath);
            // Build log options
            const logOptions = {
                '--oneline': null,
                '--pretty': 'format:%H|%an|%ae|%ad|%s',
                '--date': 'iso',
                '-n': validatedLimit
            };
            if (branch) {
                logOptions[branch] = null;
            }
            if (since) {
                logOptions['--since'] = since;
            }
            if (until) {
                logOptions['--until'] = until;
            }
            // Get commit history
            const logResult = await git.log(logOptions);
            const commits = logResult.all.map(commit => ({
                hash: commit.hash,
                author: commit.author_name,
                email: commit.author_email,
                date: commit.date,
                message: commit.message
            }));
            logger_js_1.logger.info(`Retrieved ${commits.length} commits from ${repoPath}`);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            repository: validatedPath,
                            totalCommits: commits.length,
                            commits: commits
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            logger_js_1.logger.error(`Error getting commit history for ${repoPath}`, error);
            if (error instanceof security_js_1.GitSecurityError) {
                throw error;
            }
            throw new Error(`Failed to get commit history: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=getCommitHistory.js.map