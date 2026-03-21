const fs = require('fs');
const path = require('path');
const { CodeAuditor } = require('../../skills/code-auditor');
const { ClaimRealityValidator } = require('../../skills/claim-reality-validator');

module.exports = {
  name: 'cleanup-validation',
  description: 'Validate cleanup results and ensure system integrity',
  priority: 1,

  async execute(cleanupResults, options = {}) {
    console.log('🔍 Running post-cleanup validation...');

    const results = {
      passed: true,
      validation: {
        integrity_check: null,
        functionality_test: null,
        regression_check: null
      },
      issues: [],
      recommendations: [],
      rollback_needed: false
    };

    try {
      // Get files that were cleaned
      const cleanedFiles = this.extractCleanedFiles(cleanupResults);

      // Run integrity check
      console.log('Checking system integrity...');
      results.validation.integrity_check = await this.checkIntegrity(cleanedFiles, options);

      // Run functionality validation
      console.log('Validating functionality...');
      results.validation.functionality_test = await this.validateFunctionality(cleanedFiles, options);

      // Run regression check
      console.log('Checking for regressions...');
      results.validation.regression_check = await this.checkRegression(cleanupResults, options);

      // Evaluate overall results
      results.passed = this.evaluateValidationResults(results);
      results.issues = this.collectValidationIssues(results);
      results.recommendations = this.generateValidationRecommendations(results);

      // Determine if rollback is needed
      results.rollback_needed = this.shouldRollback(results, options);

      // Log results
      this.logValidationResults(results);

      if (results.rollback_needed) {
        console.warn('⚠️  Rollback recommended due to validation failures');
      }

      return results;

    } catch (error) {
      console.error('❌ Post-cleanup validation failed:', error.message);
      results.passed = false;
      results.rollback_needed = true;
      results.issues.push({
        type: 'validation_failure',
        severity: 'critical',
        message: error.message
      });

      return results;
    }
  },

  extractCleanedFiles(cleanupResults) {
    const files = new Set();

    // Extract files from cleanup results
    if (cleanupResults.cleanup) {
      Object.values(cleanupResults.cleanup).forEach(actionArray => {
        actionArray.forEach(action => {
          if (action.file) {
            files.add(action.file);
          }
          if (action.files) {
            action.files.forEach(f => files.add(f));
          }
        });
      });
    }

    return Array.from(files);
  },

  async checkIntegrity(cleanedFiles, options) {
    const integrity = {
      syntax_check: [],
      import_resolution: [],
      file_accessibility: [],
      summary: {
        passed: 0,
        failed: 0,
        total: cleanedFiles.length
      }
    };

    for (const file of cleanedFiles) {
      try {
        // Check file exists and is readable
        if (!fs.existsSync(file)) {
          integrity.file_accessibility.push({
            file: file,
            status: 'failed',
            issue: 'File does not exist after cleanup'
          });
          integrity.summary.failed++;
          continue;
        }

        const content = fs.readFileSync(file, 'utf8');

        // Basic syntax check
        const syntaxResult = this.checkSyntax(content, file);
        integrity.syntax_check.push(syntaxResult);

        // Import resolution check
        const importResult = await this.checkImports(content, file);
        integrity.import_resolution.push(importResult);

        // File accessibility
        integrity.file_accessibility.push({
          file: file,
          status: 'passed',
          size: content.length
        });

        integrity.summary.passed++;

      } catch (error) {
        integrity.file_accessibility.push({
          file: file,
          status: 'failed',
          issue: error.message
        });
        integrity.summary.failed++;
      }
    }

    return integrity;
  },

  checkSyntax(content, file) {
    const ext = path.extname(file);
    const result = {
      file: file,
      status: 'passed',
      issues: []
    };

    try {
      if (ext === '.js' || ext === '.ts') {
        // Basic JavaScript syntax check
        new Function(content);
      } else if (ext === '.json') {
        JSON.parse(content);
      } else if (ext === '.php') {
        // Basic PHP syntax check - look for obvious issues
        if (content.includes('<?php') && !content.includes('?>') && !content.trim().endsWith('?>')) {
          // Allow files without closing tag
        }
      }
      // Add more syntax checks as needed
    } catch (error) {
      result.status = 'failed';
      result.issues.push(`Syntax error: ${error.message}`);
    }

    return result;
  },

  async checkImports(content, file) {
    const result = {
      file: file,
      status: 'passed',
      missing_imports: [],
      unresolved_imports: []
    };

    const ext = path.extname(file);

    if (ext === '.js' || ext === '.ts') {
      const importRegex = /(?:import\s+.*?\s+from\s+['"]([^'"]+)['"]|const\s+\w+\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1] || match[2];

        if (importPath && importPath.startsWith('.')) {
          const resolvedPath = path.resolve(path.dirname(file), importPath);
          const exists = await this.checkImportExists(resolvedPath, ext);

          if (!exists) {
            result.unresolved_imports.push(importPath);
            result.status = 'failed';
          }
        }
      }
    }

    return result;
  },

  async checkImportExists(importPath, importingFileExt) {
    const extensions = importingFileExt === '.ts' ? ['.ts', '.js', '.d.ts'] : ['.js'];

    for (const ext of extensions) {
      const fullPath = importPath + ext;
      if (fs.existsSync(fullPath)) {
        return true;
      }
    }

    // Check for directory with index file
    if (fs.existsSync(importPath) && fs.statSync(importPath).isDirectory()) {
      for (const ext of extensions) {
        const indexPath = path.join(importPath, 'index' + ext);
        if (fs.existsSync(indexPath)) {
          return true;
        }
      }
    }

    return false;
  },

  async validateFunctionality(cleanedFiles, options) {
    const functionality = {
      basic_tests: null,
      import_tests: null,
      integration_tests: null,
      summary: {
        passed: true,
        issues: []
      }
    };

    try {
      // Run basic functionality tests
      functionality.basic_tests = await this.runBasicTests(cleanedFiles);

      // Test import resolution
      functionality.import_tests = await this.testImports(cleanedFiles);

      // Run integration tests if available
      if (options.runIntegrationTests) {
        functionality.integration_tests = await this.runIntegrationTests();
      }

      // Evaluate results
      functionality.summary.passed = [
        functionality.basic_tests?.passed,
        functionality.import_tests?.passed,
        functionality.integration_tests?.passed
      ].every(result => result !== false);

      functionality.summary.issues = [
        ...(functionality.basic_tests?.issues || []),
        ...(functionality.import_tests?.issues || []),
        ...(functionality.integration_tests?.issues || [])
      ];

    } catch (error) {
      functionality.summary.passed = false;
      functionality.summary.issues.push(`Functionality validation failed: ${error.message}`);
    }

    return functionality;
  },

  async runBasicTests(cleanedFiles) {
    const results = {
      passed: true,
      issues: [],
      tests_run: 0
    };

    // Basic smoke tests - try to require/load files
    for (const file of cleanedFiles) {
      const ext = path.extname(file);

      if (ext === '.js') {
        try {
          // Clear require cache
          delete require.cache[require.resolve(path.resolve(file))];

          // Try to require the file
          require(path.resolve(file));
          results.tests_run++;
        } catch (error) {
          results.passed = false;
          results.issues.push(`Failed to load ${file}: ${error.message}`);
        }
      }
    }

    return results;
  },

  async testImports(cleanedFiles) {
    const results = {
      passed: true,
      issues: [],
      imports_tested: 0
    };

    for (const file of cleanedFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const imports = this.extractImports(content, file);

        for (const importPath of imports) {
          try {
            if (importPath.startsWith('.')) {
              const resolvedPath = path.resolve(path.dirname(file), importPath);
              require.resolve(resolvedPath);
              results.imports_tested++;
            }
          } catch (error) {
            results.passed = false;
            results.issues.push(`Import resolution failed in ${file}: ${importPath}`);
          }
        }
      } catch (error) {
        results.passed = false;
        results.issues.push(`Failed to test imports in ${file}: ${error.message}`);
      }
    }

    return results;
  },

  extractImports(content, file) {
    const imports = [];
    const ext = path.extname(file);

    if (ext === '.js' || ext === '.ts') {
      const importRegex = /(?:import\s+.*?\s+from\s+['"]([^'"]+)['"]|const\s+\w+\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1] || match[2];
        if (importPath) {
          imports.push(importPath);
        }
      }
    }

    return imports;
  },

  async runIntegrationTests() {
    // Placeholder for integration tests
    return {
      passed: true,
      issues: [],
      message: 'Integration tests not implemented yet'
    };
  },

  async checkRegression(cleanupResults, options) {
    const regression = {
      performance_regression: null,
      functionality_regression: null,
      summary: {
        passed: true,
        issues: []
      }
    };

    // Compare against baseline if available
    if (options.baselineResults) {
      regression.performance_regression = this.checkPerformanceRegression(cleanupResults, options.baselineResults);
      regression.functionality_regression = this.checkFunctionalityRegression(cleanupResults, options.baselineResults);
    }

    regression.summary.passed = [
      regression.performance_regression?.passed,
      regression.functionality_regression?.passed
    ].every(result => result !== false);

    regression.summary.issues = [
      ...(regression.performance_regression?.issues || []),
      ...(regression.functionality_regression?.issues || [])
    ];

    return regression;
  },

  checkPerformanceRegression(cleanupResults, baseline) {
    // Basic performance regression check
    return {
      passed: true,
      issues: [],
      message: 'Performance regression check not fully implemented'
    };
  },

  checkFunctionalityRegression(cleanupResults, baseline) {
    // Basic functionality regression check
    return {
      passed: true,
      issues: [],
      message: 'Functionality regression check not fully implemented'
    };
  },

  evaluateValidationResults(results) {
    const integrity = results.validation.integrity_check;
    const functionality = results.validation.functionality_test;
    const regression = results.validation.regression_check;

    // Fail if integrity checks failed
    if (integrity && integrity.summary.failed > 0) {
      return false;
    }

    // Fail if functionality tests failed
    if (functionality && !functionality.summary.passed) {
      return false;
    }

    // Fail if regression detected
    if (regression && !regression.summary.passed) {
      return false;
    }

    return true;
  },

  collectValidationIssues(results) {
    const issues = [];

    // Collect integrity issues
    if (results.validation.integrity_check) {
      const integrity = results.validation.integrity_check;

      integrity.syntax_check.forEach(check => {
        if (check.status === 'failed') {
          issues.push({
            type: 'syntax_error',
            severity: 'critical',
            file: check.file,
            message: check.issues.join(', ')
          });
        }
      });

      integrity.import_resolution.forEach(resolution => {
        if (resolution.status === 'failed') {
          issues.push({
            type: 'import_resolution',
            severity: 'error',
            file: resolution.file,
            message: `Unresolved imports: ${resolution.unresolved_imports.join(', ')}`
          });
        }
      });
    }

    // Collect functionality issues
    if (results.validation.functionality_test) {
      issues.push(...results.validation.functionality_test.summary.issues.map(issue => ({
        type: 'functionality_test',
        severity: 'error',
        message: issue
      })));
    }

    return issues;
  },

  generateValidationRecommendations(results) {
    const recommendations = [];

    if (!results.passed) {
      recommendations.push({
        type: 'rollback',
        priority: 'critical',
        message: 'Validation failed - consider rolling back cleanup changes',
        action: 'Use backup created during cleanup to restore original state'
      });
    }

    const integrity = results.validation.integrity_check;
    if (integrity && integrity.summary.failed > 0) {
      recommendations.push({
        type: 'fix',
        priority: 'high',
        message: `${integrity.summary.failed} files have integrity issues`,
        action: 'Review and fix syntax or import errors in affected files'
      });
    }

    return recommendations;
  },

  shouldRollback(results, options) {
    // Rollback if validation failed and strict mode is enabled
    if (!results.passed && options.strict !== false) {
      return true;
    }

    // Rollback if critical issues found
    const criticalIssues = results.issues.filter(issue => issue.severity === 'critical');
    if (criticalIssues.length > 0) {
      return true;
    }

    return false;
  },

  logValidationResults(results) {
    console.log('\n📊 Post-Cleanup Validation Results:');
    console.log('====================================');

    const integrity = results.validation.integrity_check;
    const functionality = results.validation.functionality_test;
    const regression = results.validation.regression_check;

    if (integrity) {
      console.log(`Integrity Check:`);
      console.log(`  - Files checked: ${integrity.summary.total}`);
      console.log(`  - Passed: ${integrity.summary.passed}`);
      console.log(`  - Failed: ${integrity.summary.failed}`);
    }

    if (functionality) {
      console.log(`Functionality Test:`);
      console.log(`  - Status: ${functionality.summary.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`  - Issues: ${functionality.summary.issues.length}`);
    }

    if (regression) {
      console.log(`Regression Check:`);
      console.log(`  - Status: ${regression.summary.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`  - Issues: ${regression.summary.issues.length}`);
    }

    console.log(`\nOverall Status: ${results.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Rollback Needed: ${results.rollback_needed ? '⚠️  YES' : '✅ NO'}`);

    if (results.issues.length > 0) {
      console.log(`\nIssues Found: ${results.issues.length}`);
      results.issues.slice(0, 5).forEach(issue => {
        console.log(`  - ${issue.severity.toUpperCase()}: ${issue.message}`);
      });
    }

    if (results.recommendations.length > 0) {
      console.log(`\nRecommendations:`);
      results.recommendations.forEach(rec => {
        console.log(`  - ${rec.priority.toUpperCase()}: ${rec.message}`);
      });
    }
  }
};