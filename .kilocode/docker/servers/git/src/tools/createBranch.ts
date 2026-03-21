import { z } from "zod";
import simpleGit from 'simple-git';
import { validateGitPath, isGitRepository, validateGitOperation, GitSecurityError } from "../utils/security.js";
import { logger } from "../utils/logger.js";

export const createBranchTool = {
  name: "create_branch",
  description: "Create a new branch in a git repository",
  schema: {
    repoPath: z.string().describe("Path to the git repository"),
    branchName: z.string().describe("Name of the new branch"),
    startPoint: z.string().optional().describe("Starting point (commit, branch, or tag) - default: current HEAD")
  },
  handler: async ({ repoPath, branchName, startPoint }: {
    repoPath: string;
    branchName: string;
    startPoint?: string;
  }) => {
    try {
      logger.info(`Creating branch ${branchName} in repo: ${repoPath}, startPoint: ${startPoint}`);

      // Validate operation
      validateGitOperation('branch');

      // Validate repository path
      const validatedPath = validateGitPath(repoPath);

      // Check if it's a git repository
      if (!isGitRepository(validatedPath)) {
        throw new GitSecurityError(`Path is not a git repository: ${repoPath}`, 'NOT_GIT_REPO');
      }

      // Initialize git
      const git = simpleGit(validatedPath);

      // Create branch
      await git.checkoutBranch(branchName, startPoint || 'HEAD');

      logger.info(`Successfully created and switched to branch: ${branchName}`);

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
    } catch (error) {
      logger.error(`Error creating branch ${branchName} in ${repoPath}`, error);

      if (error instanceof GitSecurityError) {
        throw error;
      }

      throw new Error(`Failed to create branch: ${error.message}`);
    }
  }
};