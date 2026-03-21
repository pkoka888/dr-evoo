const fs = require('fs');
const path = require('path');
const Joi = require('joi');

class AuditValidator {
  constructor() {
    this.auditResultSchema = Joi.object({
      validations: Joi.array().items(Joi.object({
        claim: Joi.string().required(),
        type: Joi.string().valid('functionality', 'api', 'performance', 'comment', 'test').required(),
        source: Joi.string().required(),
        status: Joi.string().valid('passed', 'failed', 'warning', 'unknown').required(),
        evidence: Joi.array().items(Joi.object()),
        issues: Joi.array().items(Joi.string()),
        confidence: Joi.number().min(0).max(1)
      })),
      summary: Joi.object({
        totalValidations: Joi.number().integer().min(0).required(),
        passed: Joi.number().integer().min(0).required(),
        failed: Joi.number().integer().min(0).required(),
        warnings: Joi.number().integer().min(0).required()
      }).required(),
      claims: Joi.array().items(Joi.object()),
      evidence: Joi.array().items(Joi.object()),
      recommendations: Joi.array().items(Joi.object({
        type: Joi.string().required(),
        message: Joi.string().required(),
        action: Joi.string().required()
      }))
    });

    this.codeAuditSchema = Joi.object({
      audit: Joi.object({
        dead_code: Joi.array().items(Joi.object()),
        unused_imports: Joi.array().items(Joi.object()),
        circular_dependencies: Joi.array().items(Joi.object()),
        code_duplication: Joi.array().items(Joi.object()),
        complexity_issues: Joi.array().items(Joi.object()),
        security_concerns: Joi.array().items(Joi.object()),
        performance_issues: Joi.array().items(Joi.object())
      }).required(),
      summary: Joi.object({
        totalFiles: Joi.number().integer().min(0).required(),
        issues: Joi.number().integer().min(0).required(),
        critical: Joi.number().integer().min(0).required(),
        warnings: Joi.number().integer().min(0).required(),
        suggestions: Joi.number().integer().min(0).required()
      }).required(),
      recommendations: Joi.array().items(Joi.object())
    });

    this.auditConfigSchema = Joi.object({
      mode: Joi.string().valid('audit').required(),
      description: Joi.string().required(),
      parallelCapable: Joi.boolean().default(false),
      operations: Joi.array().items(Joi.string()).min(1).required(),
      resources: Joi.object({
        cpu: Joi.number().min(0.1).max(4).required(),
        memory: Joi.string().pattern(/^\d+MB|GB$/).required()
      }).required(),
      dependencies: Joi.array().items(Joi.string()),
      validation: Joi.object({
        claim_vs_reality: Joi.object({
          enabled: Joi.boolean().default(true),
          sources: Joi.array().items(Joi.string()),
          validation_types: Joi.array().items(Joi.string())
        }),
        implementation_audit: Joi.object({
          enabled: Joi.boolean().default(true),
          check_types: Joi.array().items(Joi.string())
        }),
        documentation_validation: Joi.object({
          enabled: Joi.boolean().default(true),
          validate_against: Joi.array().items(Joi.string())
        })
      }),
      cleanup: Joi.object({
        procedures: Joi.array().items(Joi.string()),
        safety_checks: Joi.array().items(Joi.string())
      }),
      reporting: Joi.object({
        format: Joi.string(),
        include: Joi.array().items(Joi.string()),
        output: Joi.string()
      }),
      ai: Joi.object({
        model: Joi.string(),
        context: Joi.string(),
        validation_assistance: Joi.boolean(),
        recommendation_generation: Joi.boolean()
      })
    });
  }

  async validateAuditResults(results, options = {}) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      score: 100,
      details: {}
    };

    try {
      // Validate claim vs reality results
      if (results.claim_validation) {
        const claimValidation = this.validateClaimResults(results.claim_validation);
        validation.details.claim_validation = claimValidation;

        if (!claimValidation.isValid) {
          validation.isValid = false;
          validation.errors.push(...claimValidation.errors);
          validation.score -= 20;
        }

        validation.warnings.push(...claimValidation.warnings);
      }

      // Validate code audit results
      if (results.code_quality) {
        const codeValidation = this.validateCodeAuditResults(results.code_quality);
        validation.details.code_audit = codeValidation;

        if (!codeValidation.isValid) {
          validation.isValid = false;
          validation.errors.push(...codeValidation.errors);
          validation.score -= 15;
        }

        validation.warnings.push(...codeValidation.warnings);
      }

      // Validate overall audit structure
      const structureValidation = this.validateAuditStructure(results);
      validation.details.structure = structureValidation;

      if (!structureValidation.isValid) {
        validation.isValid = false;
        validation.errors.push(...structureValidation.errors);
        validation.score -= 10;
      }

      // Quality checks
      const qualityValidation = this.validateAuditQuality(results, options);
      validation.details.quality = qualityValidation;

      if (!qualityValidation.isValid) {
        validation.warnings.push(...qualityValidation.warnings);
        validation.score -= 5;
      }

      // Ensure score doesn't go below 0
      validation.score = Math.max(0, validation.score);

      // Add quality score interpretation
      validation.grade = this.getGradeFromScore(validation.score);

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Audit validation failed: ${error.message}`);
      validation.score = 0;
      validation.grade = 'F';
    }

    return validation;
  }

  validateClaimResults(claimResults) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Validate schema
      const { error } = this.auditResultSchema.validate(claimResults);
      if (error) {
        validation.isValid = false;
        validation.errors.push(`Schema validation failed: ${error.message}`);
        return validation;
      }

      // Validate summary consistency
      const { summary, validations } = claimResults;
      const actualPassed = validations.filter(v => v.status === 'passed').length;
      const actualFailed = validations.filter(v => v.status === 'failed').length;
      const actualWarnings = validations.filter(v => v.status === 'warning').length;

      if (summary.passed !== actualPassed) {
        validation.errors.push(`Summary passed count mismatch: expected ${summary.passed}, got ${actualPassed}`);
        validation.isValid = false;
      }

      if (summary.failed !== actualFailed) {
        validation.errors.push(`Summary failed count mismatch: expected ${summary.failed}, got ${actualFailed}`);
        validation.isValid = false;
      }

      if (summary.warnings !== actualWarnings) {
        validation.errors.push(`Summary warnings count mismatch: expected ${summary.warnings}, got ${actualWarnings}`);
        validation.isValid = false;
      }

      // Validate confidence scores
      const invalidConfidences = validations.filter(v =>
        typeof v.confidence !== 'number' || v.confidence < 0 || v.confidence > 1
      );

      if (invalidConfidences.length > 0) {
        validation.warnings.push(`${invalidConfidences.length} validations have invalid confidence scores`);
      }

      // Check for missing evidence
      const missingEvidence = validations.filter(v =>
        (v.status === 'passed' || v.status === 'warning') && (!v.evidence || v.evidence.length === 0)
      );

      if (missingEvidence.length > 0) {
        validation.warnings.push(`${missingEvidence.length} passed/warning validations lack evidence`);
      }

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Claim validation failed: ${error.message}`);
    }

    return validation;
  }

  validateCodeAuditResults(codeResults) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Validate schema
      const { error } = this.codeAuditSchema.validate(codeResults);
      if (error) {
        validation.isValid = false;
        validation.errors.push(`Schema validation failed: ${error.message}`);
        return validation;
      }

      // Validate summary consistency
      const { summary, audit } = codeResults;
      const totalIssues = Object.values(audit).reduce((sum, issues) => sum + issues.length, 0);

      if (summary.issues !== totalIssues) {
        validation.errors.push(`Summary issues count mismatch: expected ${summary.issues}, got ${totalIssues}`);
        validation.isValid = false;
      }

      // Validate issue severity counts
      const criticalCount = Object.values(audit).reduce((sum, issues) =>
        sum + issues.filter(i => i.severity === 'error' || i.severity === 'critical').length, 0
      );

      const warningCount = Object.values(audit).reduce((sum, issues) =>
        sum + issues.filter(i => i.severity === 'warning').length, 0
      );

      const suggestionCount = Object.values(audit).reduce((sum, issues) =>
        sum + issues.filter(i => i.severity === 'info' || i.severity === 'suggestion').length, 0
      );

      if (summary.critical !== criticalCount) {
        validation.errors.push(`Critical issues count mismatch: expected ${summary.critical}, got ${criticalCount}`);
        validation.isValid = false;
      }

      if (summary.warnings !== warningCount) {
        validation.errors.push(`Warning count mismatch: expected ${summary.warnings}, got ${warningCount}`);
        validation.isValid = false;
      }

      if (summary.suggestions !== suggestionCount) {
        validation.errors.push(`Suggestion count mismatch: expected ${summary.suggestions}, got ${suggestionCount}`);
        validation.isValid = false;
      }

      // Check for issues without required fields
      Object.values(audit).forEach(issues => {
        const invalidIssues = issues.filter(issue =>
          !issue.type || !issue.severity || !issue.description
        );

        if (invalidIssues.length > 0) {
          validation.warnings.push(`${invalidIssues.length} issues missing required fields`);
        }
      });

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Code audit validation failed: ${error.message}`);
    }

    return validation;
  }

  validateAuditStructure(results) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check required top-level fields
    const requiredFields = ['claim_validation', 'code_quality'];
    const missingFields = requiredFields.filter(field => !results[field]);

    if (missingFields.length > 0) {
      validation.errors.push(`Missing required audit results: ${missingFields.join(', ')}`);
      validation.isValid = false;
    }

    // Validate timestamp if present
    if (results.timestamp) {
      const timestamp = new Date(results.timestamp);
      if (isNaN(timestamp.getTime())) {
        validation.warnings.push('Invalid timestamp format');
      }
    }

    return validation;
  }

  validateAuditQuality(results, options) {
    const validation = {
      isValid: true,
      warnings: []
    };

    // Check for empty results
    if (results.claim_validation && results.claim_validation.validations.length === 0) {
      validation.warnings.push('No claim validations performed');
    }

    if (results.code_quality && Object.values(results.code_quality.audit).every(arr => arr.length === 0)) {
      validation.warnings.push('No code audit issues found - possible incomplete audit');
    }

    // Check recommendation quality
    const allRecommendations = [
      ...(results.claim_validation?.recommendations || []),
      ...(results.code_quality?.recommendations || [])
    ];

    const poorRecommendations = allRecommendations.filter(rec =>
      !rec.type || !rec.message || !rec.action
    );

    if (poorRecommendations.length > 0) {
      validation.warnings.push(`${poorRecommendations.length} recommendations missing required fields`);
    }

    return validation;
  }

  async validateAuditConfig(config) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Validate schema
      const { error } = this.auditConfigSchema.validate(config);
      if (error) {
        validation.isValid = false;
        validation.errors.push(`Configuration schema validation failed: ${error.message}`);
        return validation;
      }

      // Validate resource requirements
      if (config.resources.cpu > 2.0 && !config.parallelCapable) {
        validation.warnings.push('High CPU requirement for non-parallel mode');
      }

      // Validate operations
      const validOperations = [
        'claim_vs_reality_validation',
        'implementation_audit',
        'documentation_validation',
        'code_quality_audit',
        'security_compliance_check',
        'performance_validation',
        'cleanup_procedures'
      ];

      const invalidOperations = config.operations.filter(op => !validOperations.includes(op));
      if (invalidOperations.length > 0) {
        validation.errors.push(`Invalid operations: ${invalidOperations.join(', ')}`);
        validation.isValid = false;
      }

      // Validate dependencies exist (if specified)
      if (config.dependencies) {
        for (const dep of config.dependencies) {
          if (!await this.checkDependencyExists(dep)) {
            validation.warnings.push(`Dependency may not exist: ${dep}`);
          }
        }
      }

      // Validate output directory
      if (config.reporting?.output) {
        const outputDir = config.reporting.output;
        if (!outputDir.startsWith('./') && !outputDir.startsWith('../')) {
          validation.warnings.push('Output directory should be relative');
        }
      }

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Configuration validation failed: ${error.message}`);
    }

    return validation;
  }

  async checkDependencyExists(dependency) {
    // Basic check - in real implementation, this would check package registries
    return dependency.startsWith('@kilo-code/') || dependency.startsWith('@modelcontextprotocol/');
  }

  getGradeFromScore(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  generateValidationReport(validationResult) {
    const report = {
      timestamp: new Date().toISOString(),
      validation: validationResult,
      summary: {
        status: validationResult.isValid ? 'PASSED' : 'FAILED',
        score: validationResult.score,
        grade: validationResult.grade,
        errors: validationResult.errors.length,
        warnings: validationResult.warnings.length
      }
    };

    // Add recommendations based on validation results
    report.recommendations = [];

    if (!validationResult.isValid) {
      report.recommendations.push({
        priority: 'high',
        message: 'Fix validation errors before proceeding',
        actions: validationResult.errors
      });
    }

    if (validationResult.warnings.length > 0) {
      report.recommendations.push({
        priority: 'medium',
        message: 'Address validation warnings',
        actions: validationResult.warnings
      });
    }

    if (validationResult.score < 70) {
      report.recommendations.push({
        priority: 'high',
        message: 'Audit quality is poor - consider re-running audit',
        actions: ['Review audit configuration', 'Check audit tools', 'Validate audit inputs']
      });
    }

    return report;
  }
}

module.exports = AuditValidator;