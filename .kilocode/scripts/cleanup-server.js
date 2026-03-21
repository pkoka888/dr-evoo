#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

const { CleanupEngine } = require('../skills/cleanup-engine');
const { CleanupValidator } = require('../validators/cleanup-validator');

class CleanupServer {
  constructor() {
    this.cleanupEngine = new CleanupEngine();
    this.cleanupValidator = new CleanupValidator();

    this.server = new Server(
      {
        name: 'kilo-code-cleanup-server',
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
        name: 'run_cleanup',
        description: 'Run cleanup procedures on specified files',
        inputSchema: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of file paths to clean'
            },
            procedures: {
              type: 'array',
              items: { type: 'string' },
              description: 'Cleanup procedures to run',
              enum: ['remove_dead_code', 'optimize_imports', 'fix_circular_deps', 'standardize_formatting', 'update_dependencies']
            },
            safety_checks: {
              type: 'array',
              items: { type: 'string' },
              description: 'Safety checks to perform',
              enum: ['backup_before_cleanup', 'test_after_cleanup']
            },
            options: {
              type: 'object',
              description: 'Additional cleanup options'
            }
          },
          required: ['files']
        }
      },
      {
        name: 'validate_cleanup',
        description: 'Validate cleanup results and system integrity',
        inputSchema: {
          type: 'object',
          properties: {
            cleanup_results: {
              type: 'object',
              description: 'Results from cleanup operations'
            },
            validation_results: {
              type: 'object',
              description: 'Results from post-cleanup validation'
            },
            options: {
              type: 'object',
              description: 'Validation options'
            }
          },
          required: ['cleanup_results']
        }
      },
      {
        name: 'rollback_changes',
        description: 'Rollback cleanup changes using backup files',
        inputSchema: {
          type: 'object',
          properties: {
            cleanup_results: {
              type: 'object',
              description: 'Cleanup results containing backup information'
            },
            options: {
              type: 'object',
              description: 'Rollback options'
            }
          },
          required: ['cleanup_results']
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
        case 'run_cleanup':
          return await this.runCleanup(args);
        case 'validate_cleanup':
          return await this.validateCleanup(args);
        case 'rollback_changes':
          return await this.rollbackChanges(args);
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

  async runCleanup(args) {
    const { files, procedures, safety_checks, options = {} } = args;

    console.log(`Running cleanup on ${files.length} files...`);

    const cleanupOptions = {
      procedures: procedures || ['remove_dead_code', 'optimize_imports', 'standardize_formatting'],
      safety_checks: safety_checks || ['backup_before_cleanup'],
      ...options
    };

    const results = await this.cleanupEngine.execute(files, cleanupOptions);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  }

  async validateCleanup(args) {
    const { cleanup_results, validation_results, options = {} } = args;

    console.log('Validating cleanup results...');

    const validation = await this.cleanupValidator.validateCleanupResults(
      cleanup_results,
      validation_results,
      options
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(validation, null, 2)
        }
      ]
    };
  }

  async rollbackChanges(args) {
    const { cleanup_results, options = {} } = args;

    console.log('Rolling back cleanup changes...');

    const rollbackResults = {
      rolled_back: [],
      failed: [],
      summary: {
        total_backups: 0,
        successful: 0,
        failed: 0
      }
    };

    if (!cleanup_results.summary?.backups) {
      throw new Error('No backup information found in cleanup results');
    }

    const fs = require('fs');
    rollbackResults.summary.total_backups = cleanup_results.summary.backups.length;

    for (const backup of cleanup_results.summary.backups) {
      try {
        await fs.promises.copyFile(backup.backup, backup.original);
        rollbackResults.rolled_back.push({
          original: backup.original,
          backup: backup.backup,
          status: 'success'
        });
        rollbackResults.summary.successful++;
      } catch (error) {
        rollbackResults.failed.push({
          original: backup.original,
          backup: backup.backup,
          error: error.message,
          status: 'failed'
        });
        rollbackResults.summary.failed++;
      }
    }

    // Clean up backup directory if requested
    if (options.cleanup_backups && rollbackResults.summary.successful === rollbackResults.summary.total_backups) {
      try {
        const path = require('path');
        const backupDir = path.dirname(cleanup_results.summary.backups[0].backup);
        await fs.promises.rm(backupDir, { recursive: true, force: true });
        rollbackResults.backup_cleanup = 'completed';
      } catch (error) {
        rollbackResults.backup_cleanup = `failed: ${error.message}`;
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(rollbackResults, null, 2)
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Kilo Code Cleanup Server running...');
  }
}

// Run the server if this script is executed directly
if (require.main === module) {
  const server = new CleanupServer();
  server.run().catch(error => {
    console.error('Server error:', error);
    process.exit(1);
  });
}

module.exports = CleanupServer;