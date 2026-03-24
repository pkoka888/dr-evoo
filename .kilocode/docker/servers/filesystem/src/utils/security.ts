import * as path from "path";
import * as fs from "fs";

export interface SecurityConfig {
    allowedRootDirectories: string[];
    maxFileSizeBytes: number;
    allowedFileExtensions: string[];
    blockedPaths: string[];
}

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
    allowedRootDirectories: process.env['ALLOWED_DIRS']
        ? process.env['ALLOWED_DIRS'].split(",").map(d => path.resolve(d))
        : [path.resolve("/app/workspace"), process.cwd()], // Docker: /app/workspace, Local: cwd
    maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedFileExtensions: [
        ".txt",
        ".md",
        ".json",
        ".js",
        ".ts",
        ".py",
        ".html",
        ".css",
        ".xml",
        ".yaml",
        ".yml",
    ],
    blockedPaths: ["/etc", "/proc", "/sys", "/dev", "/root", "/home"],
};

export class SecurityError extends Error {
    constructor(
        message: string,
        public readonly code: string,
    ) {
        super(message);
        this.name = "SecurityError";
    }
}

/**
 * Validates a file path for security constraints
 */
export function validatePath(
    filePath: string,
    config: SecurityConfig = DEFAULT_SECURITY_CONFIG,
): string {
    if (!filePath || typeof filePath !== "string") {
        throw new SecurityError(
            "Invalid path: path must be a non-empty string",
            "INVALID_PATH",
        );
    }

    // Resolve the path to prevent relative path tricks
    const resolvedPath = path.resolve(filePath);

    // Check for path traversal attempts
    if (resolvedPath !== path.normalize(resolvedPath)) {
        throw new SecurityError("Path traversal detected", "PATH_TRAVERSAL");
    }

    // Check if path contains suspicious sequences
    if (resolvedPath.includes("..") || resolvedPath.includes("\0")) {
        throw new SecurityError(
            "Suspicious path characters detected",
            "SUSPICIOUS_PATH",
        );
    }

    // Check against blocked paths
    for (const blockedPath of config.blockedPaths) {
        if (resolvedPath.startsWith(blockedPath)) {
            throw new SecurityError(
                `Access to ${blockedPath} is blocked`,
                "BLOCKED_PATH",
            );
        }
    }

    // Check if path is within allowed root directories
    const isAllowed = config.allowedRootDirectories.some((rootDir) => {
        return (
            resolvedPath.startsWith(rootDir) ||
            path.relative(rootDir, resolvedPath).startsWith("..") === false
        );
    });

    if (!isAllowed) {
        throw new SecurityError(
            "Path is outside allowed directories",
            "UNAUTHORIZED_PATH",
        );
    }

    // Check file extension if specified
    if (config.allowedFileExtensions.length > 0) {
        const ext = path.extname(resolvedPath).toLowerCase();
        if (ext && !config.allowedFileExtensions.includes(ext)) {
            throw new SecurityError(
                `File extension ${ext} is not allowed`,
                "INVALID_EXTENSION",
            );
        }
    }

    return resolvedPath;
}

/**
 * Validates file size before reading
 */
export function validateFileSize(
    filePath: string,
    config: SecurityConfig = DEFAULT_SECURITY_CONFIG,
): void {
    try {
        const stats = fs.statSync(filePath);
        if (stats.size > config.maxFileSizeBytes) {
            throw new SecurityError(
                `File size ${stats.size} bytes exceeds maximum allowed size ${config.maxFileSizeBytes} bytes`,
                "FILE_TOO_LARGE",
            );
        }
    } catch (error) {
        if (error instanceof SecurityError) {
            throw error;
        }
        throw new SecurityError(
            `Cannot access file: ${error instanceof Error ? error.message : String(error)}`,
            "FILE_ACCESS_ERROR",
        );
    }
}

/**
 * Sanitizes a path string
 */
export function sanitizePath(input: string): string {
    return input.replace(/[\0\n\r\t]/g, "").trim();
}

/**
 * Checks if a path exists and is accessible
 */
export function pathExists(filePath: string): boolean {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

/**
 * Checks if a path is a directory
 */
export function isDirectory(filePath: string): boolean {
    try {
        return fs.statSync(filePath).isDirectory();
    } catch {
        return false;
    }
}

/**
 * Checks if a path is a file
 */
export function isFile(filePath: string): boolean {
    try {
        return fs.statSync(filePath).isFile();
    } catch {
        return false;
    }
}
