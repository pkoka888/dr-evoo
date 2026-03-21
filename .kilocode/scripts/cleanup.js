#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { CleanupEngine } = require('../skills/cleanup-engine');
const auditCheckHook = require('../hooks/pre-cleanup/audit-check');
const validationHook = require('../hooks/post-cleanup/validation');

class CleanupOrchestrator {
  constructor() {
    this.options = this.parseArguments();
    this.cleanupEngine = new CleanupEngine();
  }

  parseArguments() {
    const args = process.argv.slice(2);
    const options = {
      procedures: [
        'remove_dead_code',
        'optimize_imports',
        'fix_circular_deps',
        'standardize_formatting',
        'update_dependencies'
      ],
      safety_checks: ['backup_before_cleanup', 'test_after_cleanup'],
      strict: true,
      verbose: false,
      dryRun: false
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '--procedures':
        case '-p':
          options.procedures = args[++i].split(',');
          break;
        case '--no-safety':
          options.safety_checks = [];
          break;
        case '--no-strict':
          options.strict = false;
          break;
        case '--verbose':
        case '-v':
          options.verbose = true;
          break;
        case '--dry-run':
          options.dryRun = true;
          break;
        case '--files':
        case '-f':
          options.files = args[++i].split(',');
          break;
        case '--help':
        case '-h':
          this.showHelp();
          process.exit(0);
          break;
        default:
          if (arg.startsWith('-')) {
            console.error(`Unknown option: ${arg}`);
            this.showHelp();
            process.exit(1);
          }
          // Assume it's a file pattern
          options.patterns = options.patterns || [];
          options.patterns.push(arg);
      }
    }

    return options;
  }

  showHelp() {
    console.log(`
Kilo Code Cleanup Script

Usage: node cleanup.js [options] [patterns...]

Options:
  -p, --procedures <list>    Comma-separated list of cleanup procedures
                             (default: all procedures)
  --no-safety               Skip safety checks (backup, testing)
  --no-strict               Don't fail on audit warnings
  -v, --verbose             Verbose output
  --dry-run                 Show what would be done without making changes
  -f, --files <list>        Comma-separated list of specific files to clean
  -h, --help                Show this help

Procedures:
  remove_dead_code          Remove unused functions and variables
  optimize_imports          Remove unused imports
  fix_circular_deps         Attempt to fix circular dependencies
  standardize_formatting    Standardize code formatting
  update_dependencies       Update package dependencies

Examples:
  node cleanup.js                           # Run all procedures on all files
  node cleanup.js --dry-run "*.js"          # Dry run on JS files
  node cleanup.js -p remove_dead_code,optimize_imports
  node cleanup.js --no-safety --files "src/app.js,src/utils.js"
`);
  }

  async run() {
    console.log('🧹 Kilo Code Cleanup Orchestrator');
    console.log('==================================');

    try {
      // Step 1: Get files to process
      const files = await this.getFilesToProcess();
      console.log(`📁 Found ${files.length} files to process`);

      if (files.length === 0) {
        console.log('No files to process. Exiting.');
        return;
      }

      // Step 2: Pre-cleanup audit check
      console.log('\n🔍 Phase 1: Pre-Cleanup Audit');
      const auditResults = await auditCheckHook.execute({
        ...this.options,
        patterns: this.options.patterns
      });

      if (!auditResults.passed && this.options.strict) {
        console.error('❌ Pre-cleanup audit failed. Aborting cleanup.');
        console.log('Use --no-strict to continue despite audit failures.');
        process.exit(1);
      }

      // Step 3: Execute cleanup procedures
      console.log('\n🧽 Phase 2: Cleanup Execution');

      if (this.options.dryRun) {
        console.log('🔍 DRY RUN MODE - No changes will be made');
      }

      const cleanupResults = await this.cleanupEngine.execute(files, {
        ...this.options,
        dryRun: this.options.dryRun
      });

      // Step 4: Post-cleanup validation
      console.log('\n✅ Phase 3: Post-Cleanup Validation');
      const validationResults = await validationHook.execute(cleanupResults, {
        ...this.options,
        baselineResults: auditResults // Pass original audit for comparison
      });

      // Step 5: Generate final report
      console.log('\n📊 Phase 4: Final Report');
      this.generateFinalReport(auditResults, cleanupResults, validationResults);

      // Step 6: Handle rollback if needed
      if (validationResults.rollback_needed) {
        console.log('\n⚠️  Rollback recommended due to validation failures');
        await this.handleRollback(cleanupResults);
      }

      // Exit with appropriate code
      const exitCode = validationResults.passed ? 0 : 1;
      process.exit(exitCode);

    } catch (error) {
      console.error('❌ Cleanup orchestration failed:', error.message);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  async getFilesToProcess() {
    let files = [];

    if (this.options.files) {
      // Specific files provided
      files = this.options.files;
    } else if (this.options.patterns) {
      // File patterns provided
      for (const pattern of this.options.patterns) {
        const matches = await this.globFiles(pattern);
        files.push(...matches);
      }
    } else {
      // Default: find all code files
      const defaultPatterns = [
        '**/*.js',
        '**/*.ts',
        '**/*.php',
        '**/*.py',
        'package.json',
        'composer.json'
      ];

      for (const pattern of defaultPatterns) {
        const matches = await this.globFiles(pattern);
        files.push(...matches);
      }
    }

    // Filter out excluded files
    files = files.filter(file =>
      !file.includes('node_modules') &&
      !file.includes('vendor') &&
      !file.includes('.git') &&
      !file.includes('backup') &&
      !file.includes('.kilocode') &&
      !file.includes('reports')
    );

    return [...new Set(files)]; // Remove duplicates
  }

  async globFiles(pattern) {
    // Simple glob implementation
    const results = [];
    const baseDir = process.cwd();

    const walk = (dir) => {
      try {
        const files = fs.readdirSync(dir);

        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            walk(filePath);
          } else if (stat.isFile()) {
            const relativePath = path.relative(baseDir, filePath);
            if (this.matchesPattern(relativePath, pattern)) {
              results.push(relativePath);
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    walk(baseDir);
    return results;
  }

  matchesPattern(filePath, pattern) {
    // Simple pattern matching
    const regex = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\./g, '\\.')
      .replace(/\?/g, '.');

    return new RegExp(`^${regex}$`).test(filePath);
  }

  generateFinalReport(auditResults, cleanupResults, validationResults) {
    const report = {
      timestamp: new Date().toISOString(),
      options: this.options,
      phases: {
        audit: auditResults,
        cleanup: cleanupResults,
        validation: validationResults
      },
      summary: {
        total_files_processed: cleanupResults.summary.totalFiles,
        actions_performed: cleanupResults.summary.successful,
        actions_failed: cleanupResults.summary.failed,
        overall_success: validationResults.passed,
        rollback_needed: validationResults.rollback_needed
      }
    };

    // Save report
    const reportDir = path.join(process.cwd(), 'reports', 'cleanup');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `cleanup-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📄 Detailed report saved to: ${reportPath}`);

    // Console summary
    console.log('\n🎯 Cleanup Summary:');
    console.log(`   Files Processed: ${report.summary.total_files_processed}`);
    console.log(`   Actions Successful: ${report.summary.actions_performed}`);
    console.log(`   Actions Failed: ${report.summary.actions_failed}`);
    console.log(`   Overall Status: ${report.summary.overall_success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Rollback Needed: ${report.summary.rollback_needed ? '⚠️  YES' : '✅ NO'}`);

    if (cleanupResults.summary.backups.length > 0) {
      console.log(`   Backups Created: ${cleanupResults.summary.backups.length}`);
      console.log(`   Backup Location: ${path.dirname(cleanupResults.summary.backups[0].backup)}`);
    }
  }

  async handleRollback(cleanupResults) {
    if (cleanupResults.summary.backups.length === 0) {
      console.error('❌ No backups available for rollback');
      return;
    }

    console.log('🔄 Initiating rollback...');

    let rollbackCount = 0;
    let rollbackErrors = 0;

    for (const backup of cleanupResults.summary.backups) {
      try {
        await fs.promises.copyFile(backup.backup, backup.original);
        rollbackCount++;
        console.log(`   ✅ Restored: ${backup.original}`);
      } catch (error) {
        rollbackErrors++;
        console.error(`   ❌ Failed to restore: ${backup.original} - ${error.message}`);
      }
    }

    console.log(`\n🔄 Rollback Complete:`);
    console.log(`   Files Restored: ${rollbackCount}`);
    console.log(`   Errors: ${rollbackErrors}`);

    if (rollbackErrors === 0) {
      console.log('✅ Rollback successful');
    } else {
      console.warn('⚠️  Rollback completed with errors');
    }
  }
}

// Run the orchestrator
if (require.main === module) {
  const orchestrator = new CleanupOrchestrator();
  orchestrator.run().catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = CleanupOrchestrator;