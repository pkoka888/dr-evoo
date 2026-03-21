import * as path from 'path';
import * as fs from 'fs';
import { logger } from './logger.js';

export interface GitSecurityConfig {
  allowedRootDirectories: string[];
  blockedPaths: string[];
  allowedOperations: string[];
  maxCommitsLimit: number;
}

export const DEFAULT_GIT_SECURITY_CONFIG: GitSecurityConfig = {
  allowedRootDirectories: ['/app/workspace'],
  blockedPaths: ['/etc', '/proc', '/sys', '/dev', '/root', '/home'],
  allowedOperations: [
    'status', 'log', 'show', 'diff', 'branch', 'checkout', 'merge', 'pull',
    'fetch', 'add', 'commit', 'stash', 'tag', 'blame', 'rev-parse'
  ],
  maxCommitsLimit: 1000
};

export class GitSecurityError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'GitSecurityError';
  }
}

/**
 * Validates a git repository path for security constraints
 */
export function validateGitPath(repoPath: string, config: GitSecurityConfig = DEFAULT_GIT_SECURITY_CONFIG): string {
  if (!repoPath || typeof repoPath !== 'string') {
    throw new GitSecurityError('Invalid repository path: path must be a non-empty string', 'INVALID_PATH');
  }

  // Resolve the path to prevent relative path tricks
  const resolvedPath = path.resolve(repoPath);

  // Check for path traversal attempts
  if (resolvedPath !== path.normalize(resolvedPath)) {
    throw new GitSecurityError('Path traversal detected', 'PATH_TRAVERSAL');
  }

  // Check for suspicious sequences
  if (resolvedPath.includes('..') || resolvedPath.includes('\0')) {
    throw new GitSecurityError('Suspicious path characters detected', 'SUSPICIOUS_PATH');
  }

  // Check against blocked paths
  for (const blockedPath of config.blockedPaths) {
    if (resolvedPath.startsWith(blockedPath)) {
      throw new GitSecurityError(`Access to ${blockedPath} is blocked`, 'BLOCKED_PATH');
    }
  }

  // Check if path is within allowed root directories
  const isAllowed = config.allowedRootDirectories.some(rootDir => {
    return resolvedPath.startsWith(rootDir) || path.relative(rootDir, resolvedPath).startsWith('..') === false;
  });

  if (!isAllowed) {
    throw new GitSecurityError('Repository path is outside allowed directories', 'UNAUTHORIZED_PATH');
  }

  return resolvedPath;
}

/**
 * Validates if a git operation is allowed
 */
export function validateGitOperation(operation: string, config: GitSecurityConfig = DEFAULT_GIT_SECURITY_CONFIG): void {
  if (!config.allowedOperations.includes(operation)) {
    throw new GitSecurityError(`Git operation '${operation}' is not allowed`, 'OPERATION_NOT_ALLOWED');
  }
}

/**
 * Checks if a path is a valid git repository
 */
export function isGitRepository(repoPath: string): boolean {
  try {
    const gitDir = path.join(repoPath, '.git');
    return fs.existsSync(gitDir) && fs.statSync(gitDir).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Sanitizes a path string
 */
export function sanitizePath(input: string): string {
  return input.replace(/[\0\n\r\t]/g, '').trim();
}

/**
 * Validates commit limit
 */
export function validateCommitLimit(limit: number, config: GitSecurityConfig = DEFAULT_GIT_SECURITY_CONFIG): number {
  if (limit > config.maxCommitsLimit) {
    logger.warn(`Requested commit limit ${limit} exceeds maximum ${config.maxCommitsLimit}, limiting to ${config.maxCommitsLimit}`);
    return config.maxCommitsLimit;
  }
  return limit;
}