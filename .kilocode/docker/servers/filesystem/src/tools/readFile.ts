import { z } from "zod";
import * as fs from "fs";
import {
    validatePath,
    validateFileSize,
    SecurityError,
} from "../utils/security.js";
import { logger } from "../utils/logger.js";

export const readFileTool = {
    name: "read_file",
    description: "Read the contents of a file with security restrictions",
    schema: {
        path: z.string().describe("Path to the file to read"),
    },
    handler: async ({ path }: { path: string }) => {
        try {
            logger.info(`Reading file: ${path}`);

            // Validate and sanitize path
            const validatedPath = validatePath(path);

            // Check if file exists and is readable
            if (!fs.existsSync(validatedPath)) {
                throw new SecurityError(
                    `File does not exist: ${path}`,
                    "FILE_NOT_FOUND",
                );
            }

            // Validate file size
            validateFileSize(validatedPath);

            // Read file contents
            const content = fs.readFileSync(validatedPath, "utf-8");

            logger.info(
                `Successfully read file: ${path}, size: ${content.length} characters`,
            );

            return {
                content: [
                    {
                        type: "text",
                        text: content,
                    },
                ],
            };
        } catch (error) {
            logger.error(`Error reading file ${path}`, error);

            if (error instanceof SecurityError) {
                throw error;
            }

            throw new Error(
                `Failed to read file: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    },
};
