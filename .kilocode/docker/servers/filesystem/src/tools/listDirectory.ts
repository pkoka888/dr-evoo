import { z } from "zod";
import * as fs from 'fs';
import * as path from 'path';
import { validatePath, isDirectory, SecurityError } from "../utils/security.js";
import { logger } from "../utils/logger.js";

export const listDirectoryTool = {
  name: "list_directory",
  description: "List contents of a directory with optional filtering",
  schema: {
    path: z.string().describe("Path to the directory to list"),
    pattern: z.string().optional().describe("Optional glob pattern to filter results")
  },
  handler: async ({ path: dirPath, pattern }: { path: string; pattern?: string }) => {
    try {
      logger.info(`Listing directory: ${dirPath}`);

      // Validate path
      const validatedPath = validatePath(dirPath);

      // Check if path is a directory
      if (!isDirectory(validatedPath)) {
        throw new SecurityError(`Path is not a directory: ${dirPath}`, 'NOT_A_DIRECTORY');
      }

      // Read directory contents
      const items = fs.readdirSync(validatedPath);

      // Apply pattern filtering if provided
      let filteredItems = items;
      if (pattern) {
        // Simple pattern matching (could be enhanced with glob library)
        const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
        filteredItems = items.filter(item => regex.test(item));
      }

      // Get detailed information for each item
      const result = filteredItems.map(item => {
        const fullPath = path.join(validatedPath, item);
        const stats = fs.statSync(fullPath);

        return {
          name: item,
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          modified: stats.mtime.toISOString()
        };
      });

      logger.info(`Listed ${result.length} items in directory: ${dirPath}`);

      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      logger.error(`Error listing directory ${dirPath}`, error);

      if (error instanceof SecurityError) {
        throw error;
      }

      throw new Error(`Failed to list directory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};