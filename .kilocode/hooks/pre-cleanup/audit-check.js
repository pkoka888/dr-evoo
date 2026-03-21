const fs = require('fs');
const path = require('path');
const { CodeAuditor } = require('../../skills/code-auditor');
const { ClaimRealityValidator } = require('../../skills/claim-reality-validator');

module.exports = {
  name: 'audit-check',
  description: 'Run comprehensive audit checks before cleanup procedures',
  priority: 1,

  async execute(options = {}) {
    console.log('🔍 Running pre-cleanup audit checks...');

    const results = {
      passed: true,
      issues: [],
      recommendations: [],
      audit: {
        code_quality: null,
        claim_validation: null
      }
    };

    try {
      // Get files to audit
      const files = await this.getFilesToAudit(options);

      // Run code audit
      console.log('Running code quality audit...');
      const codeAuditor = new CodeAuditor();
      results.audit.code_quality = await codeAuditor.execute(files, {
        check_types: ['dead_code', 'unused_imports', 'circular_dependencies']
      });

      // Run claim vs reality validation
      console.log('Running claim vs reality validation...');
      const claimValidator = new ClaimRealityValidator();
      results.audit.claim_validation = await claimValidator.execute(files, {
        sources: ['README.md', 'docs/', 'comments'],
        validation_types: ['functionality', 'api_contracts']
      });

      // Evaluate results
      results.passed = this.evaluateAuditResults(results);
      results.issues = this.collectIssues(results);
      results.recommendations = this.generateRecommendations(results);

      // Log results
      this.logResults(results);

      // Fail if critical issues found and strict mode enabled
      if (!results.passed && options.strict !== false) {
        throw new Error('Pre-cleanup audit failed. Critical issues must be resolved before cleanup.');
      }

      return results;

    } catch (error) {
      console.error('❌ Pre-cleanup audit failed:', error.message);
      results.passed = false;
      results.issues.push({
        type: 'audit_failure',
        severity: 'critical',
        message: error.message
      });

      if (options.failOnError !== false) {
        throw error;
      }

      return results;
    }
  },

  async getFilesToAudit(options) {
    const files = [];

    // Default patterns for different file types
    const patterns = options.patterns || [
      '**/*.js',
      '**/*.ts',
      '**/*.php',
      '**/*.py',
      'README.md',
      'docs/**/*.md'
    ];

    // Use glob patterns to find files
    for (const pattern of patterns) {
      const matches = await this.globFiles(pattern);
      files.push(...matches);
    }

    // Filter out node_modules, vendor, etc.
    return files.filter(file =>
      !file.includes('node_modules') &&
      !file.includes('vendor') &&
      !file.includes('.git') &&
      !file.includes('backup')
    );
  },

  async globFiles(pattern) {
    // Simple glob implementation - in real scenario use a proper glob library
    const fs = require('fs');
    const path = require('path');

    const results = [];
    const baseDir = process.cwd();

    const walk = (dir) => {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walk(filePath);
        } else {
          const relativePath = path.relative(baseDir, filePath);
          if (this.matchesPattern(relativePath, pattern)) {
            results.push(relativePath);
          }
        }
      }
    };

    walk(baseDir);
    return results;
  },

  matchesPattern(filePath, pattern) {
    // Simple pattern matching - convert glob to regex
    const regex = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.')
      .replace(/\./g, '\\.');

    return new RegExp(`^${regex}$`).test(filePath);
  },

  evaluateAuditResults(results) {
    const codeAudit = results.audit.code_quality;
    const claimValidation = results.audit.claim_validation;

    // Check for critical issues
    const criticalIssues = [
      ...codeAudit.audit.circular_dependencies,
      ...claimValidation.validations.filter(v => v.status === 'failed')
    ];

    // Allow cleanup if only warnings and info issues
    return criticalIssues.length === 0;
  },

  collectIssues(results) {
    const issues = [];

    // Collect code audit issues
    const codeAudit = results.audit.code_quality;
    issues.push(...codeAudit.audit.dead_code.map(i => ({ ...i, category: 'code_audit' })));
    issues.push(...codeAudit.audit.unused_imports.map(i => ({ ...i, category: 'code_audit' })));
    issues.push(...codeAudit.audit.circular_dependencies.map(i => ({ ...i, category: 'code_audit' })));

    // Collect validation issues
    const claimValidation = results.audit.claim_validation;
    issues.push(...claimValidation.validations
      .filter(v => v.status !== 'passed')
      .map(v => ({
        type: 'validation_issue',
        severity: v.status === 'failed' ? 'error' : 'warning',
        message: v.issues?.join(', ') || 'Validation issue',
        category: 'claim_validation',
        claim: v.claim,
        source: v.source
      })));

    return issues;
  },

  generateRecommendations(results) {
    const recommendations = [];

    const codeAudit = results.audit.code_quality;
    const claimValidation = results.audit.claim_validation;

    // Code audit recommendations
    if (codeAudit.audit.dead_code.length > 0) {
      recommendations.push({
        type: 'cleanup',
        priority: 'high',
        message: `${codeAudit.audit.dead_code.length} dead code instances found`,
        action: 'Remove unused functions and variables'
      });
    }

    if (codeAudit.audit.unused_imports.length > 0) {
      recommendations.push({
        type: 'cleanup',
        priority: 'medium',
        message: `${codeAudit.audit.unused_imports.length} unused imports found`,
        action: 'Remove unused imports to optimize bundle size'
      });
    }

    if (codeAudit.audit.circular_dependencies.length > 0) {
      recommendations.push({
        type: 'refactor',
        priority: 'high',
        message: 'Circular dependencies detected',
        action: 'Refactor code to eliminate circular dependencies'
      });
    }

    // Validation recommendations
    const failedValidations = claimValidation.validations.filter(v => v.status === 'failed');
    if (failedValidations.length > 0) {
      recommendations.push({
        type: 'documentation',
        priority: 'medium',
        message: `${failedValidations.length} claims failed validation`,
        action: 'Update documentation or implementation to match'
      });
    }

    return recommendations;
  },

  logResults(results) {
    console.log('\n📊 Pre-Cleanup Audit Results:');
    console.log('================================');

    const codeAudit = results.audit.code_quality;
    const claimValidation = results.audit.claim_validation;

    console.log(`Code Audit:`);
    console.log(`  - Dead code: ${codeAudit.audit.dead_code.length}`);
    console.log(`  - Unused imports: ${codeAudit.audit.unused_imports.length}`);
    console.log(`  - Circular dependencies: ${codeAudit.audit.circular_dependencies.length}`);

    console.log(`Claim Validation:`);
    console.log(`  - Total validations: ${claimValidation.summary.totalValidations}`);
    console.log(`  - Passed: ${claimValidation.summary.passed}`);
    console.log(`  - Failed: ${claimValidation.summary.failed}`);
    console.log(`  - Warnings: ${claimValidation.summary.warnings}`);

    console.log(`\nOverall Status: ${results.passed ? '✅ PASSED' : '❌ FAILED'}`);

    if (results.issues.length > 0) {
      console.log(`\nIssues Found: ${results.issues.length}`);
      results.issues.slice(0, 5).forEach(issue => {
        console.log(`  - ${issue.severity.toUpperCase()}: ${issue.message}`);
      });

      if (results.issues.length > 5) {
        console.log(`  ... and ${results.issues.length - 5} more issues`);
      }
    }

    if (results.recommendations.length > 0) {
      console.log(`\nRecommendations:`);
      results.recommendations.forEach(rec => {
        console.log(`  - ${rec.priority.toUpperCase()}: ${rec.message}`);
      });
    }
  }
};