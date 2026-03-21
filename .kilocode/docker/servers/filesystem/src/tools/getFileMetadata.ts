import { z } from "zod";
import * as fs from 'fs';
import { validatePath, SecurityError } from "../utils/security.js";
import { logger } from "../utils/logger.js";

export const getFileMetadataTool = {
  name: "get_file_metadata",
  description: "Get metadata information for a file or directory",
  schema: {
    path: z.string().describe("Path to the file or directory")
  },
  handler: async ({ path }: { path: string }) => {
    try {
      logger.info(`Getting metadata for: ${path}`);

      // Validate path
      const validatedPath = validatePath(path);

      // Get file stats
      const stats = fs.statSync(validatedPath);

      const metadata = {
        path: validatedPath,
        type: stats.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        accessed: stats.atime.toISOString(),
        permissions: stats.mode.toString(8),
        isReadable: true, // We already validated access
        isWritable: false, // Read-only for security
        isExecutable: !!(stats.mode & parseInt('111', 8))
      };

      logger.info(`Retrieved metadata for: ${path}`);

      return {
        content: [{
          type: "text",
          text: JSON.stringify(metadata, null, 2)
        }]
      };
    } catch (error) {
      logger.error(`Error getting metadata for ${path}`, error);

      if (error instanceof SecurityError) {
        throw error;
      }

      throw new Error(`Failed to get metadata: ${error.message}`);
    }
  }
};