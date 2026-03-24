import { z } from "zod";
import simpleGit from 'simple-git';
import { validateGitPath, isGitRepository, GitSecurityError } from "../utils/security.js";
import { logger } from "../utils/logger.js";

export const getDiffTool = {
  name: "get_diff",
  description: "Get diff between commits, branches, or working directory",
  schema: {
    repoPath: z.string().describe("Path to the git repository"),
    from: z.string().optional().describe("Source commit/branch/tag (default: HEAD~1)"),
    to: z.string().optional().describe("Target commit/branch/tag (default: working directory)"),
    filePath: z.string().optional().describe("Specific file path to diff"),
    cached: z.boolean().optional().describe("Compare staged changes instead of working directory (default: false)")
  },
  handler: async ({ repoPath, from, to, filePath, cached = false }: {
    repoPath: string;
    from?: string;
    to?: string;
    filePath?: string;
    cached?: boolean;
  }) => {
    try {
      logger.info(`Getting diff for repo: ${repoPath}, from: ${from}, to: ${to}, file: ${filePath}`);

      // Validate repository path
      const validatedPath = validateGitPath(repoPath);

      // Check if it's a git repository
      if (!isGitRepository(validatedPath)) {
        throw new GitSecurityError(`Path is not a git repository: ${repoPath}`, 'NOT_GIT_REPO');
      }

      // Initialize git
      const git = simpleGit(validatedPath);

      // Build diff options
      const diffOptions: string[] = [];

      if (cached) {
        diffOptions.push('--cached');
      }

      if (from && to) {
        diffOptions.push(from, to);
      } else if (from) {
        diffOptions.push(from);
      }

      if (filePath) {
        diffOptions.push('--', filePath);
      }

      // Get diff
      const diffResult = await git.diff(diffOptions);

      logger.info(`Retrieved diff from ${repoPath}, length: ${diffResult.length} characters`);

      return {
        content: [{
          type: "text",
          text: diffResult || "No differences found"
        }]
      };
    } catch (error) {
      logger.error(`Error getting diff for ${repoPath}`, error);

      if (error instanceof GitSecurityError) {
        throw error;
      }

      throw new Error(`Failed to get diff: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};