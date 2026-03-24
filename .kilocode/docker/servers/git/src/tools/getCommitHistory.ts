import { z } from "zod";
import simpleGit from 'simple-git';
import { validateGitPath, isGitRepository, validateCommitLimit, GitSecurityError } from "../utils/security.js";
import { logger } from "../utils/logger.js";

export const getCommitHistoryTool = {
  name: "get_commit_history",
  description: "Get commit history for a git repository with security restrictions",
  schema: {
    repoPath: z.string().describe("Path to the git repository"),
    limit: z.number().min(1).max(1000).optional().describe("Maximum number of commits to retrieve (default: 50)"),
    branch: z.string().optional().describe("Branch name to get history from (default: current branch)"),
    since: z.string().optional().describe("Only commits after this date (ISO format)"),
    until: z.string().optional().describe("Only commits before this date (ISO format)")
  },
  handler: async ({ repoPath, limit = 50, branch, since, until }: {
    repoPath: string;
    limit?: number;
    branch?: string;
    since?: string;
    until?: string;
  }) => {
    try {
      logger.info(`Getting commit history for repo: ${repoPath}, limit: ${limit}`);

      // Validate repository path
      const validatedPath = validateGitPath(repoPath);

      // Check if it's a git repository
      if (!isGitRepository(validatedPath)) {
        throw new GitSecurityError(`Path is not a git repository: ${repoPath}`, 'NOT_GIT_REPO');
      }

      // Validate commit limit
      const validatedLimit = validateCommitLimit(limit);

      // Initialize git
      const git = simpleGit(validatedPath);

      // Build log options
      const logOptions: any = {
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

      logger.info(`Retrieved ${commits.length} commits from ${repoPath}`);

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
    } catch (error) {
      logger.error(`Error getting commit history for ${repoPath}`, error);

      if (error instanceof GitSecurityError) {
        throw error;
      }

      throw new Error(`Failed to get commit history: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};