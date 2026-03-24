export interface SecurityConfig {
    allowedRootDirectories: string[];
    maxFileSizeBytes: number;
    allowedFileExtensions: string[];
    blockedPaths: string[];
}
export declare const DEFAULT_SECURITY_CONFIG: SecurityConfig;
export declare class SecurityError extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
/**
 * Validates a file path for security constraints
 */
export declare function validatePath(filePath: string, config?: SecurityConfig): string;
/**
 * Validates file size before reading
 */
export declare function validateFileSize(filePath: string, config?: SecurityConfig): void;
/**
 * Sanitizes a path string
 */
export declare function sanitizePath(input: string): string;
/**
 * Checks if a path exists and is accessible
 */
export declare function pathExists(filePath: string): boolean;
/**
 * Checks if a path is a directory
 */
export declare function isDirectory(filePath: string): boolean;
/**
 * Checks if a path is a file
 */
export declare function isFile(filePath: string): boolean;
//# sourceMappingURL=security.d.ts.map