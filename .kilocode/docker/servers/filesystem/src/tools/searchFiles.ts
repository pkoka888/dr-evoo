import { z } from "zod";
import * as fs from 'fs';
import * as path from 'path';
import { validatePath, isDirectory, SecurityError } from "../utils/security.js";
import { logger } from "../utils/logger.js";

export const searchFilesTool = {
  name: "search_files",
  description: "Search for files and directories by name pattern",
  schema: {
    directory: z.string().describe("Root directory to search in"),
    pattern: z.string().describe("Search pattern (supports * and ? wildcards)"),
    maxResults: z.number().optional().describe("Maximum number of results to return")
  },
  handler: async ({ directory, pattern, maxResults = 100 }: { directory: string; pattern: string; maxResults?: number }) => {
    try {
      logger.info(`Searching in ${directory} for pattern: ${pattern}`);

      // Validate directory path
      const validatedDir = validatePath(directory);

      if (!isDirectory(validatedDir)) {
        throw new SecurityError(`Path is not a directory: ${directory}`, 'NOT_A_DIRECTORY');
      }

      // Convert pattern to regex
      const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));

      const results: Array<{ path: string; type: string; size?: number }> = [];

      // Recursive search function
      function searchRecursive(currentPath: string): void {
        if (results.length >= maxResults) return;

        try {
          const items = fs.readdirSync(currentPath);

          for (const item of items) {
            if (results.length >= maxResults) return;

            const fullPath = path.join(currentPath, item);

            // Validate each path for security
            try {
              validatePath(fullPath);
            } catch {
              // Skip invalid paths
              continue;
            }

            const stats = fs.statSync(fullPath);
            const relativePath = path.relative(validatedDir, fullPath);

            if (regex.test(item) || regex.test(relativePath)) {
              results.push({
                path: relativePath,
                type: stats.isDirectory() ? 'directory' : 'file',
                size: stats.size
              });
            }

            // Recurse into directories
            if (stats.isDirectory()) {
              searchRecursive(fullPath);
            }
          }
        } catch (error) {
          // Skip directories we can't read
          logger.debug(`Skipping unreadable directory: ${currentPath}`);
        }
      }

      searchRecursive(validatedDir);

      logger.info(`Search completed, found ${results.length} matches`);

      return {
        content: [{
          type: "text",
          text: JSON.stringify(results, null, 2)
        }]
      };
    } catch (error) {
      logger.error(`Error searching in ${directory} for ${pattern}`, error);

      if (error instanceof SecurityError) {
        throw error;
      }

      throw new Error(`Failed to search files: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};