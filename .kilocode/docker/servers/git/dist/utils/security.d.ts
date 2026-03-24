export interface GitSecurityConfig {
    allowedRootDirectories: string[];
    blockedPaths: string[];
    allowedOperations: string[];
    maxCommitsLimit: number;
}
export declare const DEFAULT_GIT_SECURITY_CONFIG: GitSecurityConfig;
export declare class GitSecurityError extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
/**
 * Validates a git repository path for security constraints
 */
export declare function validateGitPath(repoPath: string, config?: GitSecurityConfig): string;
/**
 * Validates if a git operation is allowed
 */
export declare function validateGitOperation(operation: string, config?: GitSecurityConfig): void;
/**
 * Checks if a path is a valid git repository
 */
export declare function isGitRepository(repoPath: string): boolean;
/**
 * Sanitizes a path string
 */
export declare function sanitizePath(input: string): string;
/**
 * Validates commit limit
 */
export declare function validateCommitLimit(limit: number, config?: GitSecurityConfig): number;
//# sourceMappingURL=security.d.ts.map