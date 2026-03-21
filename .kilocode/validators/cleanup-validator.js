const fs = require('fs');
const path = require('path');
const Joi = require('joi');

class CleanupValidator {
  constructor() {
    this.cleanupResultSchema = Joi.object({
      cleanup: Joi.object({
        removed_dead_code: Joi.array().items(Joi.object()),
        optimized_imports: Joi.array().items(Joi.object()),
        fixed_dependencies: Joi.array().items(Joi.object()),
        formatted_code: Joi.array().items(Joi.object()),
        updated_dependencies: Joi.array().items(Joi.object())
      }).required(),
      summary: Joi.object({
        totalFiles: Joi.number().integer().min(0).required(),
        actions: Joi.number().integer().min(0).required(),
        successful: Joi.number().integer().min(0).required(),
        failed: Joi.number().integer().min(0).required(),
        backups: Joi.array().items(Joi.object())
      }).required(),
      recommendations: Joi.array().items(Joi.object())
    });

    this.validationResultSchema = Joi.object({
      passed: Joi.boolean().required(),
      validation: Joi.object({
        integrity_check: Joi.object(),
        functionality_test: Joi.object(),
        regression_check: Joi.object()
      }).required(),
      issues: Joi.array().items(Joi.object()),
      recommendations: Joi.array().items(Joi.object()),
      rollback_needed: Joi.boolean()
    });
  }

  async validateCleanupResults(cleanupResults, validationResults, options = {}) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      score: 100,
      details: {
        cleanup_validation: null,
        integrity_validation: null,
        functionality_validation: null,
        overall_assessment: null
      }
    };

    try {
      // Validate cleanup results structure
      validation.details.cleanup_validation = this.validateCleanupStructure(cleanupResults);
      if (!validation.details.cleanup_validation.isValid) {
        validation.isValid = false;
        validation.errors.push(...validation.details.cleanup_validation.errors);
        validation.score -= 20;
      }

      // Validate post-cleanup validation results
      if (validationResults) {
        validation.details.integrity_validation = this.validateIntegrityResults(validationResults);
        validation.details.functionality_validation = this.validateFunctionalityResults(validationResults);

        if (!validation.details.integrity_validation.isValid) {
          validation.isValid = false;
          validation.errors.push(...validation.details.integrity_validation.errors);
          validation.score -= 25;
        }

        if (!validation.details.functionality_validation.isValid) {
          validation.isValid = false;
          validation.errors.push(...validation.details.functionality_validation.errors);
          validation.score -= 25;
        }
      }

      // Overall assessment
      validation.details.overall_assessment = this.assessOverallCleanup(cleanupResults, validationResults);

      // Quality checks
      const qualityValidation = this.validateCleanupQuality(cleanupResults, options);
      validation.warnings.push(...qualityValidation.warnings);
      validation.score -= qualityValidation.scorePenalty;

      // Ensure score doesn't go below 0
      validation.score = Math.max(0, validation.score);

      // Add grade
      validation.grade = this.getGradeFromScore(validation.score);

      // Add rollback recommendation if needed
      if (validationResults?.rollback_needed || validation.score < 50) {
        validation.recommendations = validation.recommendations || [];
        validation.recommendations.push({
          type: 'rollback',
          priority: 'critical',
          message: 'Cleanup validation failed - rollback recommended',
          action: 'Use backup files to restore original state'
        });
      }

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Cleanup validation failed: ${error.message}`);
      validation.score = 0;
      validation.grade = 'F';
    }

    return validation;
  }

  validateCleanupStructure(results) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Validate schema
      const { error } = this.cleanupResultSchema.validate(results);
      if (error) {
        validation.isValid = false;
        validation.errors.push(`Schema validation failed: ${error.message}`);
        return validation;
      }

      // Validate summary consistency
      const { summary, cleanup } = results;
      const totalActions = Object.values(cleanup).reduce((sum, actions) => sum + actions.length, 0);

      if (summary.actions !== totalActions) {
        validation.errors.push(`Summary actions count mismatch: expected ${summary.actions}, got ${totalActions}`);
        validation.isValid = false;
      }

      // Validate action results have required fields
      Object.values(cleanup).forEach(actions => {
        const invalidActions = actions.filter(action => !action.file && !action.files);
        if (invalidActions.length > 0) {
          validation.warnings.push(`${invalidActions.length} cleanup actions missing file references`);
        }
      });

      // Check backup consistency
      if (summary.backups.length > 0) {
        const invalidBackups = summary.backups.filter(backup =>
          !backup.original || !backup.backup
        );
        if (invalidBackups.length > 0) {
          validation.warnings.push(`${invalidBackups.length} backup entries are malformed`);
        }
      }

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Structure validation failed: ${error.message}`);
    }

    return validation;
  }

  validateIntegrityResults(validationResults) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      const integrity = validationResults.validation?.integrity_check;
      if (!integrity) {
        validation.errors.push('Missing integrity check results');
        validation.isValid = false;
        return validation;
      }

      // Validate file accessibility
      const accessibility = integrity.file_accessibility || [];
      const failedFiles = accessibility.filter(check => check.status === 'failed');

      if (failedFiles.length > 0) {
        validation.errors.push(`${failedFiles.length} files became inaccessible after cleanup`);
        validation.isValid = false;
      }

      // Validate syntax checks
      const syntaxChecks = integrity.syntax_check || [];
      const failedSyntax = syntaxChecks.filter(check => check.status === 'failed');

      if (failedSyntax.length > 0) {
        validation.errors.push(`${failedSyntax.length} files have syntax errors after cleanup`);
        validation.isValid = false;
      }

      // Validate import resolution
      const importChecks = integrity.import_resolution || [];
      const failedImports = importChecks.filter(check => check.status === 'failed');

      if (failedImports.length > 0) {
        validation.warnings.push(`${failedImports.length} files have unresolved imports after cleanup`);
        // This is a warning, not an error, as some imports might be expected to be unresolved
      }

      // Validate summary
      const summary = integrity.summary || {};
      const totalChecks = (accessibility.length + syntaxChecks.length + importChecks.length);
      const reportedTotal = summary.total || 0;

      if (reportedTotal !== totalChecks) {
        validation.warnings.push(`Integrity check count mismatch: expected ${totalChecks}, got ${reportedTotal}`);
      }

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Integrity validation failed: ${error.message}`);
    }

    return validation;
  }

  validateFunctionalityResults(validationResults) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      const functionality = validationResults.validation?.functionality_test;
      if (!functionality) {
        validation.errors.push('Missing functionality test results');
        validation.isValid = false;
        return validation;
      }

      // Check if functionality tests passed
      if (!functionality.summary?.passed) {
        validation.isValid = false;
        validation.errors.push('Functionality tests failed after cleanup');

        // Add specific issues
        const issues = functionality.summary?.issues || [];
        validation.errors.push(...issues.map(issue => `Functionality issue: ${issue}`));
      }

      // Validate test results structure
      const basicTests = functionality.basic_tests;
      const importTests = functionality.import_tests;

      if (basicTests && basicTests.tests_run === 0) {
        validation.warnings.push('No basic functionality tests were run');
      }

      if (importTests && importTests.imports_tested === 0) {
        validation.warnings.push('No import resolution tests were performed');
      }

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Functionality validation failed: ${error.message}`);
    }

    return validation;
  }

  assessOverallCleanup(cleanupResults, validationResults) {
    const assessment = {
      success_rate: 0,
      risk_level: 'low',
      confidence: 0,
      issues: []
    };

    // Calculate success rate
    const { summary } = cleanupResults;
    if (summary.actions > 0) {
      assessment.success_rate = (summary.successful / summary.actions) * 100;
    }

    // Determine risk level
    if (validationResults?.rollback_needed) {
      assessment.risk_level = 'critical';
    } else if (!validationResults?.passed) {
      assessment.risk_level = 'high';
    } else if (assessment.success_rate < 80) {
      assessment.risk_level = 'medium';
    } else {
      assessment.risk_level = 'low';
    }

    // Calculate confidence
    assessment.confidence = Math.min(100, assessment.success_rate);

    if (validationResults?.passed) {
      assessment.confidence += 20;
    }

    if (summary.backups.length > 0) {
      assessment.confidence += 10;
    }

    assessment.confidence = Math.min(100, Math.max(0, assessment.confidence));

    // Identify issues
    if (assessment.success_rate < 50) {
      assessment.issues.push('Low cleanup success rate');
    }

    if (assessment.risk_level === 'critical') {
      assessment.issues.push('Critical validation failures detected');
    }

    return assessment;
  }

  validateCleanupQuality(cleanupResults, options) {
    const validation = {
      warnings: [],
      scorePenalty: 0
    };

    const { summary, cleanup } = cleanupResults;

    // Check for excessive failures
    if (summary.failed > summary.successful) {
      validation.warnings.push('More cleanup failures than successes');
      validation.scorePenalty += 15;
    }

    // Check for empty cleanup
    const totalChanges = Object.values(cleanup).reduce((sum, actions) => sum + actions.length, 0);
    if (totalChanges === 0) {
      validation.warnings.push('No cleanup actions were performed');
      validation.scorePenalty += 10;
    }

    // Check backup coverage
    if (summary.backups.length === 0 && !options.skipBackup) {
      validation.warnings.push('No backups were created');
      validation.scorePenalty += 5;
    }

    // Check for high-risk procedures without backups
    const highRiskProcedures = ['remove_dead_code', 'fix_circular_deps'];
    const performedHighRisk = Object.keys(cleanup).filter(proc =>
      highRiskProcedures.includes(proc) && cleanup[proc].length > 0
    );

    if (performedHighRisk.length > 0 && summary.backups.length === 0) {
      validation.warnings.push('High-risk procedures performed without backups');
      validation.scorePenalty += 20;
    }

    return validation;
  }

  getGradeFromScore(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  async validateCleanupConfig(config) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Basic config validation
    if (!config.procedures || !Array.isArray(config.procedures)) {
      validation.errors.push('Cleanup procedures must be an array');
      validation.isValid = false;
    }

    if (!config.safety_checks || !Array.isArray(config.safety_checks)) {
      validation.warnings.push('Safety checks should be specified');
    }

    // Validate procedures
    const validProcedures = [
      'remove_dead_code',
      'optimize_imports',
      'fix_circular_deps',
      'standardize_formatting',
      'update_dependencies'
    ];

    if (config.procedures) {
      const invalidProcedures = config.procedures.filter(proc => !validProcedures.includes(proc));
      if (invalidProcedures.length > 0) {
        validation.errors.push(`Invalid procedures: ${invalidProcedures.join(', ')}`);
        validation.isValid = false;
      }
    }

    // Validate safety checks
    const validSafetyChecks = [
      'backup_before_cleanup',
      'test_after_cleanup',
      'rollback_on_failure'
    ];

    if (config.safety_checks) {
      const invalidChecks = config.safety_checks.filter(check => !validSafetyChecks.includes(check));
      if (invalidChecks.length > 0) {
        validation.warnings.push(`Unknown safety checks: ${invalidChecks.join(', ')}`);
      }
    }

    return validation;
  }

  generateValidationReport(validationResult, cleanupResults, validationResults) {
    const report = {
      timestamp: new Date().toISOString(),
      validation: validationResult,
      cleanup_summary: {
        total_files: cleanupResults.summary.totalFiles,
        actions_performed: cleanupResults.summary.successful,
        actions_failed: cleanupResults.summary.failed,
        backups_created: cleanupResults.summary.backups.length
      },
      validation_summary: validationResults ? {
        integrity_passed: validationResults.validation?.integrity_check?.summary?.passed === validationResults.validation?.integrity_check?.summary?.total,
        functionality_passed: validationResults.validation?.functionality_test?.summary?.passed,
        rollback_needed: validationResults.rollback_needed
      } : null,
      recommendations: []
    };

    // Add recommendations
    if (!validationResult.isValid) {
      report.recommendations.push({
        priority: 'critical',
        type: 'fix_errors',
        message: 'Critical validation errors must be addressed',
        actions: validationResult.errors
      });
    }

    if (validationResult.warnings.length > 0) {
      report.recommendations.push({
        priority: 'medium',
        type: 'address_warnings',
        message: 'Review and address validation warnings',
        actions: validationResult.warnings
      });
    }

    if (validationResult.score < 70) {
      report.recommendations.push({
        priority: 'high',
        type: 'improve_cleanup',
        message: 'Cleanup quality needs improvement',
        actions: [
          'Review cleanup configuration',
          'Ensure proper backup procedures',
          'Run more comprehensive validation tests'
        ]
      });
    }

    return report;
  }
}

module.exports = CleanupValidator;