import { z } from "zod";
import simpleGit from 'simple-git';
import { validateGitPath, isGitRepository, validateGitOperation, GitSecurityError } from "../utils/security.js";
import { logger } from "../utils/logger.js";

export const switchBranchTool = {
  name: "switch_branch",
  description: "Switch to a different branch in a git repository",
  schema: {
    repoPath: z.string().describe("Path to the git repository"),
    branchName: z.string().describe("Name of the branch to switch to"),
    create: z.boolean().optional().describe("Create the branch if it doesn't exist (default: false)")
  },
  handler: async ({ repoPath, branchName, create = false }: {
    repoPath: string;
    branchName: string;
    create?: boolean;
  }) => {
    try {
      logger.info(`Switching to branch ${branchName} in repo: ${repoPath}, create: ${create}`);

      // Validate operation
      validateGitOperation('checkout');

      // Validate repository path
      const validatedPath = validateGitPath(repoPath);

      // Check if it's a git repository
      if (!isGitRepository(validatedPath)) {
        throw new GitSecurityError(`Path is not a git repository: ${repoPath}`, 'NOT_GIT_REPO');
      }

      // Initialize git
      const git = simpleGit(validatedPath);

      // Switch branch
      if (create) {
        await git.checkoutBranch(branchName, 'HEAD');
      } else {
        await git.checkout(branchName);
      }

      logger.info(`Successfully switched to branch: ${branchName}`);

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
    } catch (error) {
      logger.error(`Error switching to branch ${branchName} in ${repoPath}`, error);

      if (error instanceof GitSecurityError) {
        throw error;
      }

      throw new Error(`Failed to switch branch: ${error.message}`);
    }
  }
};