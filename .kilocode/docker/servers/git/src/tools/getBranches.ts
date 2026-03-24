import { z } from "zod";
import simpleGit from "simple-git";
import {
    validateGitPath,
    isGitRepository,
    GitSecurityError,
} from "../utils/security.js";
import { logger } from "../utils/logger.js";

export const getBranchesTool = {
    name: "get_branches",
    description: "Get list of branches in a git repository",
    schema: {
        repoPath: z.string().describe("Path to the git repository"),
        all: z
            .boolean()
            .optional()
            .describe("Include remote branches (default: false)"),
    },
    handler: async ({
        repoPath,
        all = false,
    }: {
        repoPath: string;
        all?: boolean;
    }) => {
        try {
            logger.info(`Getting branches for repo: ${repoPath}, all: ${all}`);

            // Validate repository path
            const validatedPath = validateGitPath(repoPath);

            // Check if it's a git repository
            if (!isGitRepository(validatedPath)) {
                throw new GitSecurityError(
                    `Path is not a git repository: ${repoPath}`,
                    "NOT_GIT_REPO",
                );
            }

            // Initialize git
            const git = simpleGit(validatedPath);

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

            logger.info(
                `Retrieved branches from ${repoPath}: ${branches.local.length} local, ${branches.remote.length} remote`,
            );

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(
                            {
                                repository: validatedPath,
                                current: branches.current,
                                branches: branches,
                            },
                            null,
                            2,
                        ),
                    },
                ],
            };
        } catch (error) {
            logger.error(`Error getting branches for ${repoPath}`, error);

            if (error instanceof GitSecurityError) {
                throw error;
            }

            throw new Error(
                `Failed to get branches: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    },
};
