#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

const { CodeAuditor } = require('../skills/code-auditor');
const { ClaimRealityValidator } = require('../skills/claim-reality-validator');
const { AuditValidator } = require('../validators/audit-validator');

class AuditServer {
  constructor() {
    this.codeAuditor = new CodeAuditor();
    this.claimValidator = new ClaimRealityValidator();
    this.auditValidator = new AuditValidator();

    this.server = new Server(
      {
        name: 'kilo-code-audit-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.server.setRequestHandler(ListToolsRequestSchema, this.handleListTools.bind(this));
    this.server.setRequestHandler(CallToolRequestSchema, this.handleCallTool.bind(this));
  }

  setupToolHandlers() {
    this.tools = [
      {
        name: 'run_audit',
        description: 'Run comprehensive code audit on specified files',
        inputSchema: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of file paths to audit'
            },
            check_types: {
              type: 'array',
              items: { type: 'string' },
              description: 'Types of checks to perform',
              enum: ['dead_code', 'unused_imports', 'circular_dependencies', 'code_duplication']
            },
            options: {
              type: 'object',
              description: 'Additional audit options'
            }
          },
          required: ['files']
        }
      },
      {
        name: 'validate_claims',
        description: 'Validate claims vs reality for specified files',
        inputSchema: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of file paths to validate'
            },
            sources: {
              type: 'array',
              items: { type: 'string' },
              description: 'Sources to extract claims from',
              enum: ['README.md', 'docs/', 'comments', 'tests']
            },
            validation_types: {
              type: 'array',
              items: { type: 'string' },
              description: 'Types of validations to perform'
            },
            options: {
              type: 'object',
              description: 'Additional validation options'
            }
          },
          required: ['files']
        }
      },
      {
        name: 'generate_report',
        description: 'Generate audit report from results',
        inputSchema: {
          type: 'object',
          properties: {
            audit_results: {
              type: 'object',
              description: 'Results from audit operations'
            },
            format: {
              type: 'string',
              enum: ['json', 'markdown', 'html'],
              default: 'json'
            },
            output_path: {
              type: 'string',
              description: 'Path to save the report'
            }
          },
          required: ['audit_results']
        }
      }
    ];
  }

  handleListTools() {
    return { tools: this.tools };
  }

  async handleCallTool(request) {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'run_audit':
          return await this.runAudit(args);
        case 'validate_claims':
          return await this.validateClaims(args);
        case 'generate_report':
          return await this.generateReport(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }

  async runAudit(args) {
    const { files, check_types, options = {} } = args;

    console.log(`Running code audit on ${files.length} files...`);

    const auditOptions = {
      check_types: check_types || ['dead_code', 'unused_imports', 'circular_dependencies'],
      ...options
    };

    const results = await this.codeAuditor.execute(files, auditOptions);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  }

  async validateClaims(args) {
    const { files, sources, validation_types, options = {} } = args;

    console.log(`Running claim validation on ${files.length} files...`);

    const validationOptions = {
      sources: sources || ['README.md', 'docs/', 'comments'],
      validation_types: validation_types || ['functionality', 'api_contracts'],
      ...options
    };

    const results = await this.claimValidator.execute(files, validationOptions);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  }

  async generateReport(args) {
    const { audit_results, format = 'json', output_path } = args;

    console.log(`Generating audit report in ${format} format...`);

    // Validate the audit results
    const validation = await this.auditValidator.validateAuditResults(audit_results);

    let reportContent;
    switch (format) {
      case 'markdown':
        reportContent = this.generateMarkdownReport(audit_results, validation);
        break;
      case 'html':
        reportContent = this.generateHtmlReport(audit_results, validation);
        break;
      default:
        reportContent = JSON.stringify({
          audit_results,
          validation
        }, null, 2);
    }

    // Save to file if output path provided
    if (output_path) {
      const fs = require('fs');
      const path = require('path');
      const outputDir = path.dirname(output_path);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(output_path, reportContent);
      console.log(`Report saved to: ${output_path}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: reportContent
        }
      ]
    };
  }

  generateMarkdownReport(auditResults, validation) {
    let report = '# Kilo Code Audit Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    // Validation Summary
    report += '## Validation Summary\n\n';
    report += `Status: ${validation.isValid ? '✅ PASSED' : '❌ FAILED'}\n`;
    report += `Score: ${validation.score}/100 (${validation.grade})\n`;
    report += `Errors: ${validation.errors.length}\n`;
    report += `Warnings: ${validation.warnings.length}\n\n`;

    // Audit Results
    if (auditResults.claim_validation) {
      const claims = auditResults.claim_validation;
      report += '## Claim vs Reality Validation\n\n';
      report += `Total Validations: ${claims.summary.totalValidations}\n`;
      report += `Passed: ${claims.summary.passed}\n`;
      report += `Failed: ${claims.summary.failed}\n`;
      report += `Warnings: ${claims.summary.warnings}\n\n`;

      if (claims.validations.length > 0) {
        report += '### Validation Details\n\n';
        claims.validations.slice(0, 10).forEach(validation => {
          const status = validation.status === 'passed' ? '✅' :
                        validation.status === 'failed' ? '❌' : '⚠️';
          report += `- ${status} ${validation.claim.substring(0, 100)}...\n`;
        });

        if (claims.validations.length > 10) {
          report += `- ... and ${claims.validations.length - 10} more validations\n`;
        }
        report += '\n';
      }
    }

    if (auditResults.code_quality) {
      const code = auditResults.code_quality;
      report += '## Code Quality Audit\n\n';
      report += `Files Audited: ${code.summary.totalFiles}\n`;
      report += `Issues Found: ${code.summary.issues}\n`;
      report += `Critical: ${code.summary.critical}\n`;
      report += `Warnings: ${code.summary.warnings}\n\n`;

      // Issue breakdown
      const issues = code.audit;
      if (issues.dead_code.length > 0) {
        report += `### Dead Code: ${issues.dead_code.length} issues\n\n`;
      }
      if (issues.unused_imports.length > 0) {
        report += `### Unused Imports: ${issues.unused_imports.length} issues\n\n`;
      }
      if (issues.circular_dependencies.length > 0) {
        report += `### Circular Dependencies: ${issues.circular_dependencies.length} issues\n\n`;
      }
    }

    // Recommendations
    const allRecommendations = [
      ...(auditResults.claim_validation?.recommendations || []),
      ...(auditResults.code_quality?.recommendations || [])
    ];

    if (allRecommendations.length > 0) {
      report += '## Recommendations\n\n';
      allRecommendations.forEach(rec => {
        report += `- **${rec.priority.toUpperCase()}**: ${rec.message}\n`;
        if (rec.action) {
          report += `  - ${rec.action}\n`;
        }
      });
      report += '\n';
    }

    return report;
  }

  generateHtmlReport(auditResults, validation) {
    // Basic HTML report - could be enhanced with styling
    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Kilo Code Audit Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f0f0f0; padding: 10px; border-radius: 5px; }
        .passed { color: green; }
        .failed { color: red; }
        .warning { color: orange; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Kilo Code Audit Report</h1>
    <p>Generated: ${new Date().toISOString()}</p>

    <div class="summary">
        <h2>Validation Summary</h2>
        <p class="${validation.isValid ? 'passed' : 'failed'}">
            Status: ${validation.isValid ? 'PASSED' : 'FAILED'}
        </p>
        <p>Score: ${validation.score}/100 (${validation.grade})</p>
        <p>Errors: ${validation.errors.length}</p>
        <p>Warnings: ${validation.warnings.length}</p>
    </div>

    <h2>Audit Results</h2>
`;

    if (auditResults.claim_validation) {
      const claims = auditResults.claim_validation;
      html += `
    <h3>Claim vs Reality Validation</h3>
    <table>
        <tr><th>Metric</th><th>Count</th></tr>
        <tr><td>Total Validations</td><td>${claims.summary.totalValidations}</td></tr>
        <tr><td>Passed</td><td class="passed">${claims.summary.passed}</td></tr>
        <tr><td>Failed</td><td class="failed">${claims.summary.failed}</td></tr>
        <tr><td>Warnings</td><td class="warning">${claims.summary.warnings}</td></tr>
    </table>
`;
    }

    if (auditResults.code_quality) {
      const code = auditResults.code_quality;
      html += `
    <h3>Code Quality Audit</h3>
    <table>
        <tr><th>Metric</th><th>Count</th></tr>
        <tr><td>Files Audited</td><td>${code.summary.totalFiles}</td></tr>
        <tr><td>Issues Found</td><td>${code.summary.issues}</td></tr>
        <tr><td>Critical</td><td class="failed">${code.summary.critical}</td></tr>
        <tr><td>Warnings</td><td class="warning">${code.summary.warnings}</td></tr>
    </table>
`;
    }

    html += `
</body>
</html>`;

    return html;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Kilo Code Audit Server running...');
  }
}

// Run the server if this script is executed directly
if (require.main === module) {
  const server = new AuditServer();
  server.run().catch(error => {
    console.error('Server error:', error);
    process.exit(1);
  });
}

module.exports = AuditServer;