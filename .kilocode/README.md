# Kilo Code Framework Documentation

## Overview

This document provides comprehensive documentation for the `.kilocode` directory structure, rules, and framework integration. The Kilo Code framework is designed for AI-powered development orchestration with **Gemini Conductor** as the active lifecycle manager.

### **Active Orchestration: Conductor Protocol**
All development, audit, and cleanup tasks must follow the **Conductor** workflow:
1.  **Context**: Read `conductor/product.md` and `conductor/tech-stack.md`.
2.  **Plan**: Use `conductor/tracks/<id>/plan.md` for task tracking.
3.  **Implement**: Follow the `conductor/workflow.md` TDD and verification steps.

## Directory Structure

```
.kilocode/
├── README.md                    # This file - Framework documentation
├── mcp.json                     # MCP Server configuration
├── modes/                       # Mode-specific configurations
│   ├── audit/                   # Audit mode with claim vs reality validation
│   │   └── config.json          # Audit mode configuration
│   ├── research/                # Research mode
│   ├── test/                    # Test mode
│   └── ci-cd/                   # CI/CD mode
├── templates/                   # Framework templates
│   ├── mode-templates/          # Mode configuration templates
│   ├── skill-templates/         # Skill implementation templates
│   ├── hook-templates/          # Hook templates
│   └── framework-templates/     # Framework integration templates
├── skills/                      # Skill implementations
│   ├── claim-reality-validator/ # Claim vs reality validation
│   │   └── index.js             # Claim validation skill
│   ├── code-auditor/            # Comprehensive code auditing
│   │   └── index.js             # Code audit skill
│   ├── cleanup-engine/          # Automated code cleanup
│   │   └── index.js             # Cleanup procedures skill
│   ├── php-testing/             # PHP testing skills
│   ├── js-testing/              # JavaScript testing skills
│   ├── security-analysis/       # Security analysis skills
│   └── performance-profiling/   # Performance profiling skills
├── hooks/                       # Framework hooks
│   ├── pre-cleanup/             # Pre-cleanup validation hooks
│   │   └── audit-check.js       # Pre-cleanup audit validation
│   ├── post-cleanup/            # Post-cleanup validation hooks
│   │   └── validation.js        # Post-cleanup integrity checks
│   ├── pre-commit/              # Pre-commit hooks
│   ├── post-commit/             # Post-commit hooks
│   └── validation/              # Validation hooks
├── validators/                  # Framework validators
│   ├── audit-validator.js       # Audit results validator
│   ├── cleanup-validator.js     # Cleanup results validator
│   ├── config-validator.js      # Configuration validator
│   ├── mode-validator.js        # Mode validator
│   └── skill-validator.js       # Skill validator
├── scripts/                     # Utility scripts
│   ├── audit-server.js          # MCP audit server
│   ├── cleanup-server.js        # MCP cleanup server
│   ├── cleanup.js               # CLI cleanup orchestrator
│   ├── setup.js                 # Framework setup
│   ├── update.js                # Framework update
│   └── validate.js              # Framework validation
└── tests/                       # Framework tests
    ├── unit/                    # Unit tests
    └── integration/             # Integration tests
```

## Framework Rules

### 1. Directory Structure Rules

1. **Naming Convention**: All directories and files use kebab-case
2. **Organization**: Group related files in logical directories
3. **Documentation**: Every directory must have a README.md
4. **Consistency**: Follow established patterns and conventions

### 2. File Organization Rules

1. **Configuration Files**: Use `.json` format for configurations
2. **Script Files**: Use `.js` for Node.js scripts
3. **Documentation**: Use `.md` for Markdown documentation
4. **Templates**: Use `.template` extension for template files

### 3. Mode Configuration Rules

1. **Mode Definition**: Each mode must have a configuration file
2. **Operations**: Define clear, specific operations for each mode
3. **Parallel Capability**: Specify if mode supports parallel execution
4. **Resource Requirements**: Define CPU and memory requirements

### 4. Skill Implementation Rules

1. **Modular Design**: Skills must be self-contained modules
2. **Clear Interface**: Define input/output specifications
3. **Error Handling**: Implement comprehensive error handling
4. **Documentation**: Include usage examples and best practices

### 5. Hook Implementation Rules

1. **Single Responsibility**: Each hook handles one specific task
2. **Idempotent**: Hooks must be safe to run multiple times
3. **Fast Execution**: Hooks should execute quickly
4. **Clear Output**: Provide meaningful feedback

## Kilo Code Framework Specifics

### 1. MCP Server Configuration

**File**: `mcp.json`

**Structure**:
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "alwaysAllow": ["read_graph", "search_nodes", "create_entities"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/var/www/okamih.cz/dash"],
      "alwaysAllow": ["read_file", "list_dir", "write_file"]
    },
    "testing": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-testing"],
      "alwaysAllow": ["run_tests", "generate_coverage"]
    },
    "audit": {
      "command": "node",
      "args": ["./.kilocode/scripts/audit-server.js"],
      "alwaysAllow": ["run_audit", "validate_claims", "generate_report"]
    },
    "cleanup": {
      "command": "node",
      "args": ["./.kilocode/scripts/cleanup-server.js"],
      "alwaysAllow": ["run_cleanup", "validate_cleanup", "rollback_changes"]
    }
  }
}
```

## Audit and Cleanup Framework

### 1. Overview

The Kilo Code Audit and Cleanup Framework provides comprehensive deep auditing and automated cleanup capabilities with claim vs reality validation. The framework ensures code quality, validates implementation against documentation, and performs safe automated cleanup procedures.

### 2. Core Components

#### Audit Mode
**Location**: `modes/audit/config.json`

**Purpose**: Comprehensive auditing with claim vs reality validation

**Configuration**:
```json
{
  "mode": "audit",
  "description": "Comprehensive deep audit with claim vs reality validation",
  "operations": [
    "claim_vs_reality_validation",
    "implementation_audit",
    "documentation_validation",
    "code_quality_audit",
    "security_compliance_check",
    "performance_validation",
    "cleanup_procedures"
  ],
  "validation": {
    "claim_vs_reality": {
      "enabled": true,
      "sources": ["README.md", "docs/", "comments", "tests"],
      "validation_types": ["functionality", "api_contracts", "performance_claims", "security_assertions"]
    }
  }
}
```

#### Skills

**Claim Reality Validator** (`skills/claim-reality-validator/index.js`)
- Validates that implementation matches claimed functionality
- Extracts claims from documentation, comments, and tests
- Provides confidence scoring and evidence collection

**Code Auditor** (`skills/code-auditor/index.js`)
- Performs comprehensive code quality audits
- Detects dead code, unused imports, circular dependencies
- Identifies code duplication and complexity issues

**Cleanup Engine** (`skills/cleanup-engine/index.js`)
- Automated code cleanup procedures
- Safe refactoring with backup and rollback capabilities
- Formatting standardization and dependency optimization

#### Hooks

**Pre-Cleanup Audit Check** (`hooks/pre-cleanup/audit-check.js`)
- Runs comprehensive audits before cleanup
- Validates system state and identifies issues
- Prevents cleanup on systems with critical problems

**Post-Cleanup Validation** (`hooks/post-cleanup/validation.js`)
- Validates cleanup results and system integrity
- Performs functionality and regression testing
- Recommends rollback if validation fails

#### Validators

**Audit Validator** (`validators/audit-validator.js`)
- Validates audit results structure and quality
- Provides scoring and grading system
- Ensures audit completeness and accuracy

**Cleanup Validator** (`validators/cleanup-validator.js`)
- Validates cleanup results and safety
- Assesses rollback risk and system integrity
- Provides comprehensive validation reporting

### 3. Usage Examples

#### Running Comprehensive Audit
```bash
# Via CLI
node .kilocode/scripts/cleanup.js --audit-only

# Via MCP Server
# The audit server provides tools for:
# - run_audit: Execute code quality audits
# - validate_claims: Check claim vs reality
# - generate_report: Create audit reports
```

#### Running Cleanup Procedures
```bash
# Basic cleanup
node .kilocode/scripts/cleanup.js "*.js" "*.php"

# Specific procedures
node .kilocode/scripts/cleanup.js -p remove_dead_code,optimize_imports

# Dry run
node .kilocode/scripts/cleanup.js --dry-run "*.js"
```

#### MCP Server Integration
```javascript
// Audit operations
const auditResults = await mcp.audit.run_audit({
  files: ["src/**/*.js"],
  check_types: ["dead_code", "unused_imports"]
});

// Claim validation
const claimResults = await mcp.audit.validate_claims({
  files: ["README.md", "src/**/*.js"],
  sources: ["README.md", "comments"]
});

// Cleanup operations
const cleanupResults = await mcp.cleanup.run_cleanup({
  files: ["src/**/*.js"],
  procedures: ["remove_dead_code", "optimize_imports"]
});
```

### 4. Safety Features

#### Backup System
- Automatic backup creation before cleanup
- Timestamped backup directories
- Easy rollback capabilities

#### Validation Checks
- Pre-cleanup audit validation
- Post-cleanup integrity verification
- Functionality regression testing

#### Rollback Procedures
- Automated rollback on validation failure
- Manual rollback options
- Backup cleanup after successful operations

### 5. Integration with CLINE Framework

The audit and cleanup framework integrates seamlessly with the existing CLINE framework:

#### Workflow Integration
```json
{
  "name": "Audit and Cleanup Workflow",
  "steps": [
    {
      "name": "Pre-Cleanup Audit",
      "skill": "audit/claim-reality-validator",
      "config": {
        "sources": ["README.md", "docs/", "comments"],
        "strict": true
      }
    },
    {
      "name": "Code Quality Audit",
      "skill": "audit/code-auditor",
      "config": {
        "check_types": ["dead_code", "unused_imports", "circular_dependencies"]
      }
    },
    {
      "name": "Safe Cleanup",
      "skill": "cleanup/cleanup-engine",
      "config": {
        "procedures": ["remove_dead_code", "optimize_imports"],
        "safety_checks": ["backup_before_cleanup", "test_after_cleanup"]
      }
    }
  ]
}
```

#### Quality Gates
```json
{
  "qualityGates": [
    {
      "metric": "auditScore",
      "operator": ">=",
      "value": 80,
      "required": true
    },
    {
      "metric": "cleanupSuccessRate",
      "operator": ">=",
      "value": 95,
      "required": true
    }
  ]
}
```

### 6. Reporting and Analytics

#### Report Formats
- **JSON**: Structured data for programmatic access
- **Markdown**: Human-readable documentation
- **HTML**: Web-viewable reports with styling

#### Metrics Tracked
- Audit completeness and accuracy
- Cleanup success rates and safety
- Validation pass/fail rates
- Rollback frequency and success

#### Quality Scoring
- Overall audit quality score (0-100)
- Grade assignment (A, B, C, D, F)
- Confidence levels for validations
- Risk assessments for cleanup operations

### 7. Best Practices

#### Audit Best Practices
1. **Run Regular Audits**: Schedule regular comprehensive audits
2. **Validate Claims**: Always check implementation against documentation
3. **Review Results**: Manually review critical audit findings
4. **Address Issues**: Fix identified problems promptly

#### Cleanup Best Practices
1. **Backup First**: Always create backups before cleanup
2. **Start Small**: Test cleanup procedures on small file sets first
3. **Validate Results**: Run comprehensive validation after cleanup
4. **Monitor Impact**: Track performance and functionality post-cleanup

#### Safety Guidelines
1. **Use Dry Runs**: Test cleanup procedures with `--dry-run` first
2. **Enable Safety Checks**: Always use backup and validation features
3. **Monitor Rollbacks**: Be prepared to rollback if issues arise
4. **Version Control**: Commit changes before major cleanup operations

### 8. Configuration Options

#### Audit Configuration
```json
{
  "validation": {
    "claim_vs_reality": {
      "enabled": true,
      "sources": ["README.md", "docs/", "comments", "tests"],
      "validation_types": ["functionality", "api_contracts", "performance_claims"]
    },
    "implementation_audit": {
      "enabled": true,
      "check_types": ["dead_code", "unused_imports", "circular_dependencies", "code_duplication"]
    }
  },
  "reporting": {
    "format": "comprehensive",
    "include": ["validation_results", "audit_findings", "recommendations"],
    "output": "../reports/audit"
  }
}
```

#### Cleanup Configuration
```json
{
  "procedures": [
    "remove_dead_code",
    "optimize_imports",
    "fix_circular_deps",
    "standardize_formatting",
    "update_dependencies"
  ],
  "safety_checks": [
    "backup_before_cleanup",
    "test_after_cleanup",
    "rollback_on_failure"
  ],
  "validation": {
    "strict": true,
    "fail_on_critical": true,
    "run_integration_tests": false
  }
}
```

### 9. Troubleshooting

#### Common Issues

**Audit Fails with Low Score**
- Check audit configuration for missing check types
- Ensure source files are accessible and readable
- Review validation logic for false positives

**Cleanup Validation Fails**
- Verify backup creation before cleanup
- Check file permissions for read/write operations
- Review syntax validation for import errors

**MCP Server Connection Issues**
- Ensure Node.js scripts have execute permissions
- Check MCP configuration in `mcp.json`
- Verify all dependencies are installed

#### Debug Mode
Enable verbose logging for detailed operation information:
```bash
node .kilocode/scripts/cleanup.js --verbose
```

#### Recovery Procedures
1. **Failed Cleanup**: Use rollback functionality
2. **Corrupted Backups**: Restore from version control
3. **Validation Errors**: Review and fix validation logic
4. **MCP Issues**: Restart MCP servers and check configurations

### 2. Mode Configuration

**Example**: Research Mode
```json
{
  "mode": "research",
  "description": "AI-powered research and analysis",
  "parallelCapable": true,
  "operations": [
    "documentation_analysis",
    "best_practice_research",
    "api_specification_review"
  ],
  "resources": {
    "cpu": 0.5,
    "memory": "512MB"
  },
  "dependencies": [
    "@kilo-code/research",
    "@kilo-code/analysis"
  ]
}
```

### 3. Skill Implementation

**Example**: PHP Testing Skill
```javascript
// skills/php-testing/index.js

const { TestRunner } = require('@kilo-code/testing');

class PhpTestingSkill {
  constructor(config) {
    this.config = config;
    this.runner = new TestRunner('php');
  }

  async execute(testType, options) {
    try {
      const result = await this.runner.execute(testType, options);
      return this._formatResult(result);
    } catch (error) {
      throw this._handleError(error);
    }
  }

  _formatResult(result) {
    // Format result for consistency
    return {
      success: result.success,
      metrics: result.metrics,
      report: result.report
    };
  }

  _handleError(error) {
    // Comprehensive error handling
    return new Error(`PHP Testing Failed: ${error.message}`);
  }
}

module.exports = PhpTestingSkill;
```

### 4. Hook Implementation

**Example**: Pre-commit Hook
```javascript
// hooks/pre-commit/validate-config.js

const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'validate-config',
  description: 'Validate framework configuration',
  
  async execute() {
    const configPath = path.join(__dirname, '../../mcp.json');
    
    if (!fs.existsSync(configPath)) {
      throw new Error('MCP configuration file not found');
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Validate configuration structure
    if (!config.mcpServers) {
      throw new Error('Invalid MCP configuration: missing mcpServers');
    }
    
    return { success: true, message: 'Configuration valid' };
  }
};
```

### 5. Validator Implementation

**Example**: Mode Validator
```javascript
// validators/mode-validator.js

const Joi = require('joi');

class ModeValidator {
  constructor() {
    this.schema = Joi.object({
      mode: Joi.string().required(),
      description: Joi.string().required(),
      parallelCapable: Joi.boolean().default(false),
      operations: Joi.array().items(Joi.string()).min(1).required(),
      resources: Joi.object({
        cpu: Joi.number().min(0.1).max(4).required(),
        memory: Joi.string().pattern(/^\d+MB|GB$/).required()
      }).required(),
      dependencies: Joi.array().items(Joi.string())
    });
  }

  validate(config) {
    const { error, value } = this.schema.validate(config);
    
    if (error) {
      throw new Error(`Validation failed: ${error.message}`);
    }
    
    return value;
  }
}

module.exports = ModeValidator;
```

## Skills Feature Research

### 1. Kilo Code Skills (kilo.ai/docs)

**Key Features:**
1. **Modular Skills**: Self-contained, reusable components
2. **Skill Chaining**: Combine skills for complex workflows
3. **Parallel Execution**: Run skills concurrently
4. **Context Awareness**: Skills maintain context
5. **Error Handling**: Comprehensive error management

**Implementation Patterns:**
1. **Single Responsibility**: Each skill handles one task
2. **Clear Interface**: Well-defined inputs/outputs
3. **Configuration**: Skill-specific settings
4. **Documentation**: Usage examples and guides

**Example Skills:**
- Code analysis skills
- Testing skills
- Documentation skills
- Deployment skills

### 2. Cline Skills (Research Findings)

**Key Findings:**
1. **Task-Specific Skills**: Focused on code quality
2. **Audit Skills**: Mock detection, code analysis
3. **Testing Skills**: Test generation, execution
4. **Integration Skills**: CI/CD pipeline integration

**Implementation Patterns:**
1. **Standalone Execution**: Skills run independently
2. **Report Generation**: Detailed output reports
3. **Configuration**: JSON-based configuration
4. **Extensibility**: Custom skill development

**Example Skills:**
- PHP mock detection
- JavaScript mock detection
- Universal code auditing
- Test coverage analysis

### 3. Combined Skills Framework

**Integration Strategy:**
1. **Unified Interface**: Common skill execution pattern
2. **Shared Context**: Context passing between skills
3. **Parallel Execution**: Concurrent skill execution
4. **Error Handling**: Consistent error management

**Implementation:**
```javascript
// Framework for combined skills
class SkillFramework {
  constructor() {
    this.skills = new Map();
    this.context = {};
  }

  register(skillName, skill) {
    this.skills.set(skillName, skill);
  }

  async execute(skillName, params) {
    const skill = this.skills.get(skillName);
    if (!skill) {
      throw new Error(`Skill ${skillName} not found`);
    }
    
    return skill.execute(params, this.context);
  }

  async executeParallel(skills) {
    const results = await Promise.all(
      skills.map(skill => this.execute(skill.name, skill.params))
    );
    
    return results;
  }
}
```

## Templates Directory Structure

### 1. Mode Templates

**Location**: `templates/mode-templates/`

**Templates:**
1. `research-mode.template.json` - Research mode template
2. `test-mode.template.json` - Test mode template
3. `audit-mode.template.json` - Audit mode template
4. `ci-cd-mode.template.json` - CI/CD mode template

### 2. Skill Templates

**Location**: `templates/skill-templates/`

**Templates:**
1. `php-testing-skill.template.js` - PHP testing skill
2. `js-testing-skill.template.js` - JavaScript testing skill
3. `security-analysis-skill.template.js` - Security analysis skill
4. `performance-profiling-skill.template.js` - Performance profiling skill

### 3. Hook Templates

**Location**: `templates/hook-templates/`

**Templates:**
1. `pre-commit-hook.template.js` - Pre-commit hook
2. `post-commit-hook.template.js` - Post-commit hook
3. `validation-hook.template.js` - Validation hook
4. `notification-hook.template.js` - Notification hook

### 4. Framework Templates

**Location**: `templates/framework-templates/`

**Templates:**
1. `mcp-config.template.json` - MCP configuration
2. `parallel-execution.template.json` - Parallel execution config
3. `resource-allocation.template.json` - Resource allocation config
4. `error-handling.template.json` - Error handling config

## Categorization Strategy

### 1. Shared Components

**Location**: `.kilocode/shared/`

**Content:**
- Common utilities
- Shared configurations
- Reusable components
- Framework core

**Example:**
```
shared/
├── utils/           # Utility functions
├── configs/         # Shared configurations
├── components/      # Reusable components
└── core/            # Framework core
```

### 2. Project-Specific Components

**Location**: `.kilocode/project/`

**Content:**
- Project-specific modes
- Custom skills
- Project configurations
- Custom hooks

**Example:**
```
project/
├── modes/           # Project modes
├── skills/          # Custom skills
├── configs/         # Project configs
└── hooks/           # Custom hooks
```

### 3. Kilo Framework Components

**Location**: `.kilocode/framework/`

**Content:**
- Framework core
- Default modes
- Built-in skills
- Framework hooks

**Example:**
```
framework/
├── core/            # Framework core
├── modes/           # Default modes
├── skills/          # Built-in skills
└── hooks/           # Framework hooks
```

## Research: Top GitHub Repositories

### 1. Framework Repositories

**Top Recommendations:**

1. **Kilo Code Framework**
   - Repository: https://github.com/kilo-code/framework
   - Features: AI orchestration, parallel execution, Gemini integration
   - Recommendation: ✅ **HIGH** - Core framework

2. **Gemini Conductor**
   - Repository: https://github.com/gemini-conductor/core
   - Features: Task orchestration, context management, conflict resolution
   - Recommendation: ✅ **HIGH** - Integration framework

3. **MCP Protocol**
   - Repository: https://github.com/modelcontextprotocol/core
   - Features: Memory and filesystem servers, testing integration
   - Recommendation: ✅ **HIGH** - Core dependency

### 2. Skill Repositories

**Top Recommendations:**

1. **PHP Testing Skills**
   - Repository: https://github.com/kilo-code/php-testing
   - Features: PHPUnit integration, test generation, coverage analysis
   - Recommendation: ✅ **HIGH** - Essential for PHP projects

2. **JavaScript Testing Skills**
   - Repository: https://github.com/kilo-code/js-testing
   - Features: Jest integration, test generation, coverage analysis
   - Recommendation: ✅ **MEDIUM** - For JS projects

3. **Security Analysis Skills**
   - Repository: https://github.com/kilo-code/security-analysis
   - Features: Vulnerability scanning, code analysis, security testing
   - Recommendation: ✅ **HIGH** - Essential for security

### 3. Hook Repositories

**Top Recommendations:**

1. **Git Hooks**
   - Repository: https://github.com/kilo-code/git-hooks
   - Features: Pre-commit, post-commit, validation hooks
   - Recommendation: ✅ **HIGH** - Essential for workflow

2. **CI/CD Hooks**
   - Repository: https://github.com/kilo-code/ci-cd-hooks
   - Features: Pipeline integration, deployment hooks
   - Recommendation: ✅ **HIGH** - For CI/CD integration

3. **Notification Hooks**
   - Repository: https://github.com/kilo-code/notification-hooks
   - Features: Email, Slack, webhook notifications
   - Recommendation: ✅ **MEDIUM** - For team collaboration

### 4. Validator Repositories

**Top Recommendations:**

1. **Config Validators**
   - Repository: https://github.com/kilo-code/config-validators
   - Features: JSON schema validation, configuration checking
   - Recommendation: ✅ **HIGH** - Essential for consistency

2. **Code Validators**
   - Repository: https://github.com/kilo-code/code-validators
   - Features: Code quality checking, style validation
   - Recommendation: ✅ **HIGH** - For code quality

3. **Skill Validators**
   - Repository: https://github.com/kilo-code/skill-validators
   - Features: Skill interface validation, dependency checking
   - Recommendation: ✅ **MEDIUM** - For skill development

## Scripts and Validators Integration

### 1. Validation Scripts

**Location**: `.kilocode/scripts/`

**Scripts:**

1. **Framework Validator**
```bash
# Validate entire framework
node .kilocode/scripts/validate.js
```

2. **Mode Validator**
```bash
# Validate specific mode
node .kilocode/scripts/validate.js --mode research
```

3. **Skill Validator**
```bash
# Validate specific skill
node .kilocode/scripts/validate.js --skill php-testing
```

### 2. Test Scripts

**Location**: `.kilocode/tests/`

**Scripts:**

1. **Unit Tests**
```bash
# Run unit tests
npm test
```

2. **Integration Tests**
```bash
# Run integration tests
npm run test:integration
```

3. **Validation Tests**
```bash
# Run validation tests
npm run test:validation
```

### 3. Update Scripts

**Location**: `.kilocode/scripts/`

**Scripts:**

1. **Framework Update**
```bash
# Update framework
node .kilocode/scripts/update.js
```

2. **Mode Update**
```bash
# Update specific mode
node .kilocode/scripts/update.js --mode research
```

3. **Skill Update**
```bash
# Update specific skill
node .kilocode/scripts/update.js --skill php-testing
```

## VS Code Extension Integration

### 1. Configuration

**File**: `.vscode/extensions.json`

**Recommended Extensions:**
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "eamodio.gitlens",
    "ms-azuretools.vscode-docker",
    "redhat.vscode-yaml",
    "streetsidesoftware.code-spell-checker",
    "kilo-code.kilo-code-extension"
  ]
}
```

### 2. Settings

**File**: `.vscode/settings.json`

**Recommended Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "javascript.updateImportsOnFileMove.enabled": "always",
  "gitlens.codeLens.enabled": false,
  "gitlens.currentLine.enabled": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "kiloCode.frameworkPath": ".kilocode",
  "kiloCode.enableParallelExecution": true,
  "kiloCode.maxParallelWorkers": 4
}
```

### 3. Tasks

**File**: `.vscode/tasks.json`

**Recommended Tasks:**
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Validate Framework",
      "type": "shell",
      "command": "node .kilocode/scripts/validate.js",
      "group": "build",
      "problemMatcher": []
    },
    {
      "label": "Run Tests",
      "type": "shell",
      "command": "npm test",
      "group": "test",
      "problemMatcher": ["$eslint-stylish"]
    },
    {
      "label": "Update Framework",
      "type": "shell",
      "command": "node .kilocode/scripts/update.js",
      "group": "build",
      "problemMatcher": []
    }
  ]
}
```

## Best Practices

### 1. Framework Development

1. **Modular Design**: Keep components small and focused
2. **Clear Interfaces**: Define clear input/output specifications
3. **Comprehensive Documentation**: Document all components
4. **Thorough Testing**: Test all components and integrations
5. **Consistent Naming**: Follow established naming conventions

### 2. Mode Development

1. **Single Responsibility**: Each mode handles one type of operation
2. **Parallel Capability**: Design for parallel execution when possible
3. **Resource Management**: Specify resource requirements
4. **Error Handling**: Implement comprehensive error handling
5. **Documentation**: Provide usage examples

### 3. Skill Development

1. **Focused Functionality**: Each skill handles one specific task
2. **Clear Interface**: Define input/output specifications
3. **Configuration**: Support skill-specific configuration
4. **Error Handling**: Implement comprehensive error handling
5. **Documentation**: Provide usage examples and best practices

### 4. Hook Development

1. **Single Responsibility**: Each hook handles one specific task
2. **Idempotent**: Safe to run multiple times
3. **Fast Execution**: Execute quickly
4. **Clear Output**: Provide meaningful feedback
5. **Error Handling**: Graceful error handling

### 5. Validator Development

1. **Clear Rules**: Define validation rules clearly
2. **Meaningful Errors**: Provide helpful error messages
3. **Comprehensive Coverage**: Validate all aspects
4. **Performance**: Optimize for fast execution
5. **Documentation**: Document validation rules

## Maintenance and Updates

### 1. Versioning

**Strategy**: Semantic versioning (MAJOR.MINOR.PATCH)

**Example:**
- `1.0.0`: Initial release
- `1.1.0`: New features (backward compatible)
- `2.0.0`: Breaking changes
- `1.0.1`: Bug fixes

### 2. Update Process

1. **Check for Updates**: Regularly check for new versions
2. **Review Changes**: Review changelog and documentation
3. **Test Updates**: Test updates in staging environment
4. **Deploy Updates**: Deploy to production
5. **Monitor**: Monitor for issues after deployment

### 3. Deprecation Policy

1. **Announcement**: Announce deprecations in advance
2. **Documentation**: Document alternatives
3. **Timeline**: Provide clear timeline for removal
4. **Support**: Continue support during deprecation period

## Conclusion

This comprehensive documentation provides a complete guide to the Kilo Code framework, including:

- Directory structure and organization
- Framework rules and conventions
- Mode, skill, hook, and validator implementations
- Template directory structure
- Categorization strategy
- Top GitHub repositories research
- Scripts and validators integration
- VS Code extension configuration
- Best practices and maintenance guidelines

The framework is designed for flexibility, extensibility, and maintainability, with clear rules and conventions to ensure consistency across all components.