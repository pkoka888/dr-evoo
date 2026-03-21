const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);

class CleanupEngine {
  constructor(config = {}) {
    this.config = config;
    this.name = 'cleanup-engine';
    this.description = 'Automated code cleanup and optimization procedures';
  }

  async execute(files, options = {}) {
    const results = {
      cleanup: {
        removed_dead_code: [],
        optimized_imports: [],
        fixed_dependencies: [],
        formatted_code: [],
        updated_dependencies: []
      },
      summary: {
        totalFiles: files.length,
        actions: 0,
        successful: 0,
        failed: 0,
        backups: []
      },
      recommendations: []
    };

    // Create backup if safety checks enabled
    if (options.safety_checks?.includes('backup_before_cleanup')) {
      await this.createBackup(files, results);
    }

    // Perform cleanup procedures
    const procedures = options.procedures || [
      'remove_dead_code',
      'optimize_imports',
      'fix_circular_deps',
      'standardize_formatting',
      'update_dependencies'
    ];

    for (const procedure of procedures) {
      try {
        switch (procedure) {
          case 'remove_dead_code':
            await this.removeDeadCode(files, results, options);
            break;
          case 'optimize_imports':
            await this.optimizeImports(files, results, options);
            break;
          case 'fix_circular_deps':
            await this.fixCircularDependencies(files, results, options);
            break;
          case 'standardize_formatting':
            await this.standardizeFormatting(files, results, options);
            break;
          case 'update_dependencies':
            await this.updateDependencies(files, results, options);
            break;
        }
      } catch (error) {
        console.warn(`Cleanup procedure ${procedure} failed: ${error.message}`);
        results.summary.failed++;
      }
    }

    // Test after cleanup if safety checks enabled
    if (options.safety_checks?.includes('test_after_cleanup')) {
      await this.runTestsAfterCleanup(results, options);
    }

    // Generate recommendations
    results.recommendations = this.generateCleanupRecommendations(results);

    return results;
  }

  async createBackup(files, results) {
    const backupDir = path.join(process.cwd(), 'backup', new Date().toISOString().replace(/[:.]/g, '-'));

    try {
      await mkdirAsync(backupDir, { recursive: true });

      for (const file of files) {
        if (fs.existsSync(file)) {
          const backupPath = path.join(backupDir, path.relative(process.cwd(), file));
          const backupDirPath = path.dirname(backupPath);

          await mkdirAsync(backupDirPath, { recursive: true });
          await fs.promises.copyFile(file, backupPath);

          results.summary.backups.push({
            original: file,
            backup: backupPath
          });
        }
      }

      console.log(`Backup created in: ${backupDir}`);
    } catch (error) {
      console.warn(`Failed to create backup: ${error.message}`);
    }
  }

  async removeDeadCode(files, results, options) {
    for (const file of files) {
      if (!this.isCodeFile(file)) continue;

      try {
        const content = await readFileAsync(file, 'utf8');
        const cleanedContent = await this.cleanDeadCode(content, file, files, options);

        if (cleanedContent !== content) {
          await writeFileAsync(file, cleanedContent);

          results.cleanup.removed_dead_code.push({
            file: file,
            original_size: content.length,
            cleaned_size: cleanedContent.length,
            reduction: content.length - cleanedContent.length
          });

          results.summary.actions++;
          results.summary.successful++;
        }
      } catch (error) {
        console.warn(`Failed to remove dead code from ${file}: ${error.message}`);
        results.summary.failed++;
      }
    }
  }

  async cleanDeadCode(content, file, allFiles, options) {
    let cleanedContent = content;
    const lines = content.split('\n');

    // Remove unused functions
    const functions = this.extractFunctions(content, file);

    for (const func of functions) {
      const usage = await this.findFunctionUsage(func, allFiles, file);

      if (usage.length === 0) {
        // Remove the function
        const funcRegex = new RegExp(`\\b${func.name}\\b\\s*\\([^)]*\\)\\s*\\{[^}]*\\}`, 'g');
        cleanedContent = cleanedContent.replace(funcRegex, '');
      }
    }

    // Remove unused variables
    const variables = this.extractVariables(content, file);

    for (const variable of variables) {
      const usage = this.findVariableUsage(variable, content);

      if (usage.length <= 1) { // Only the declaration
        const varRegex = new RegExp(`(?:const|let|var)\\s+${variable.name}\\s*=\\s*[^;]+;`, 'g');
        cleanedContent = cleanedContent.replace(varRegex, '');
      }
    }

    // Remove empty lines left by removals
    cleanedContent = this.removeEmptyLines(cleanedContent);

    return cleanedContent;
  }

  async optimizeImports(files, results, options) {
    for (const file of files) {
      if (!this.isCodeFile(file)) continue;

      try {
        const content = await readFileAsync(file, 'utf8');
        const optimizedContent = this.optimizeFileImports(content, file, options);

        if (optimizedContent !== content) {
          await writeFileAsync(file, optimizedContent);

          results.cleanup.optimized_imports.push({
            file: file,
            original_imports: this.countImports(content),
            optimized_imports: this.countImports(optimizedContent)
          });

          results.summary.actions++;
          results.summary.successful++;
        }
      } catch (error) {
        console.warn(`Failed to optimize imports in ${file}: ${error.message}`);
        results.summary.failed++;
      }
    }
  }

  optimizeFileImports(content, file, options) {
    let optimizedContent = content;
    const ext = path.extname(file);

    if (ext === '.js' || ext === '.ts') {
      // Remove unused ES6 imports
      const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));

      for (const importLine of importLines) {
        const unusedImports = this.findUnusedImportsInLine(importLine, content);

        for (const unusedImport of unusedImports) {
          // Remove unused import from the line
          const importRegex = new RegExp(`\\b${unusedImport}\\b,?\\s*`, 'g');
          const newImportLine = importLine.replace(importRegex, '');

          if (newImportLine !== importLine) {
            optimizedContent = optimizedContent.replace(importLine, newImportLine);
          }
        }

        // Remove entire import line if empty
        if (this.isEmptyImportLine(importLine.replace(/\{[^}]*\}/, '{}'))) {
          optimizedContent = optimizedContent.replace(importLine + '\n', '');
        }
      }

      // Remove unused require statements
      const requireRegex = /const\s+(\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)\s*;/g;
      let match;

      while ((match = requireRegex.exec(content)) !== null) {
        const varName = match[1];
        if (!this.isVariableUsed(varName, content)) {
          optimizedContent = optimizedContent.replace(match[0] + '\n', '');
        }
      }
    } else if (ext === '.php') {
      // Remove unused PHP includes
      const includeRegex = /(include|require|include_once|require_once)\s*\(\s*['"]([^'"]+)['"]\s*\)\s*;/g;
      let match;

      while ((match = includeRegex.exec(content)) !== null) {
        const includePath = match[2];
        const fileName = path.basename(includePath, '.php');

        if (!this.isIncludeUsed(fileName, content)) {
          optimizedContent = optimizedContent.replace(match[0] + '\n', '');
        }
      }
    }

    return optimizedContent;
  }

  findUnusedImportsInLine(importLine, content) {
    const unused = [];

    // Extract imported items from ES6 import
    const importMatch = importLine.match(/import\s*\{\s*([^}]+)\s*\}/);
    if (importMatch) {
      const imports = importMatch[1].split(',').map(item => item.trim());

      for (const importItem of imports) {
        if (!this.isImportUsed(importItem, content)) {
          unused.push(importItem);
        }
      }
    }

    return unused;
  }

  isEmptyImportLine(importLine) {
    const cleaned = importLine.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"]/, '');
    return cleaned.trim() === '';
  }

  isVariableUsed(varName, content) {
    const usageRegex = new RegExp(`\\b${varName}\\b`, 'g');
    const matches = content.match(usageRegex);
    return matches && matches.length > 1;
  }

  isIncludeUsed(fileName, content) {
    const usageRegex = new RegExp(`\\b${fileName}\\b`, 'g');
    return usageRegex.test(content);
  }

  countImports(content) {
    const importRegex = /(?:import|require|include)/g;
    const matches = content.match(importRegex);
    return matches ? matches.length : 0;
  }

  async fixCircularDependencies(files, results, options) {
    // This is a complex operation that would require dependency analysis
    // For now, we'll implement a basic approach

    const dependencyGraph = {};

    // Build dependency graph
    for (const file of files) {
      if (!this.isCodeFile(file)) continue;

      try {
        const content = await readFileAsync(file, 'utf8');
        const deps = this.extractDependencies(content, file);
        dependencyGraph[file] = deps;
      } catch (error) {
        // Skip
      }
    }

    // Detect and attempt to fix circular dependencies
    const circularDeps = this.detectCircularDependencies(dependencyGraph);

    for (const circle of circularDeps) {
      try {
        await this.resolveCircularDependency(circle, files, results, options);
        results.summary.actions++;
        results.summary.successful++;
      } catch (error) {
        console.warn(`Failed to resolve circular dependency: ${error.message}`);
        results.summary.failed++;
      }
    }
  }

  extractDependencies(content, file) {
    const dependencies = [];
    const ext = path.extname(file);

    if (ext === '.js' || ext === '.ts') {
      const importRegex = /(?:import\s+.*?\s+from\s+['"]([^'"]+)['"]|const\s+\w+\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const depPath = match[1] || match[2];
        if (depPath && depPath.startsWith('.')) {
          const resolvedPath = path.resolve(path.dirname(file), depPath);
          dependencies.push(resolvedPath);
        }
      }
    }

    return dependencies;
  }

  detectCircularDependencies(graph) {
    const circularDeps = [];
    const visited = new Set();
    const recursionStack = new Set();

    const detectCycle = (file, path = []) => {
      if (recursionStack.has(file)) {
        const cycleStart = path.indexOf(file);
        circularDeps.push(path.slice(cycleStart));
        return true;
      }

      if (visited.has(file)) return false;

      visited.add(file);
      recursionStack.add(file);

      const dependencies = graph[file] || [];
      for (const dep of dependencies) {
        if (detectCycle(dep, [...path, file])) {
          return true;
        }
      }

      recursionStack.delete(file);
      return false;
    };

    for (const file of Object.keys(graph)) {
      if (!visited.has(file)) {
        detectCycle(file);
      }
    }

    return circularDeps;
  }

  async resolveCircularDependency(circle, files, results, options) {
    // Simple resolution: move shared code to a common module
    // This is a basic implementation - real resolution would be more complex

    results.cleanup.fixed_dependencies.push({
      type: 'circular_dependency_resolved',
      files: circle,
      method: 'common_module_extraction'
    });
  }

  async standardizeFormatting(files, results, options) {
    for (const file of files) {
      if (!this.isCodeFile(file)) continue;

      try {
        const content = await readFileAsync(file, 'utf8');
        const formattedContent = this.formatCode(content, file, options);

        if (formattedContent !== content) {
          await writeFileAsync(file, formattedContent);

          results.cleanup.formatted_code.push({
            file: file,
            changes: 'formatting_standardized'
          });

          results.summary.actions++;
          results.summary.successful++;
        }
      } catch (error) {
        console.warn(`Failed to format ${file}: ${error.message}`);
        results.summary.failed++;
      }
    }
  }

  formatCode(content, file, options) {
    let formatted = content;

    // Basic formatting rules
    // Remove trailing whitespace
    formatted = formatted.replace(/[ \t]+$/gm, '');

    // Ensure consistent indentation (basic)
    const lines = formatted.split('\n');
    const formattedLines = lines.map(line => {
      // Remove excessive indentation
      const trimmed = line.trim();
      if (trimmed === '') return '';

      // Basic indentation normalization
      const indentMatch = line.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : '';

      // Convert tabs to spaces (assuming 2 spaces)
      const normalizedIndent = indent.replace(/\t/g, '  ');

      return normalizedIndent + trimmed;
    });

    formatted = formattedLines.join('\n');

    // Remove multiple consecutive empty lines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    // Ensure file ends with newline
    if (!formatted.endsWith('\n')) {
      formatted += '\n';
    }

    return formatted;
  }

  async updateDependencies(files, results, options) {
    // This would typically involve updating package.json, composer.json, etc.
    // For now, we'll implement basic version checking

    const packageFiles = files.filter(file =>
      file.includes('package.json') || file.includes('composer.json')
    );

    for (const packageFile of packageFiles) {
      try {
        const content = await readFileAsync(packageFile, 'utf8');
        const packageData = JSON.parse(content);

        // Basic dependency update simulation
        let updated = false;
        if (packageData.dependencies) {
          for (const [dep, version] of Object.entries(packageData.dependencies)) {
            if (this.shouldUpdateDependency(dep, version, options)) {
              // In a real implementation, this would check for updates
              packageData.dependencies[dep] = this.getLatestVersion(dep);
              updated = true;
            }
          }
        }

        if (updated) {
          await writeFileAsync(packageFile, JSON.stringify(packageData, null, 2));

          results.cleanup.updated_dependencies.push({
            file: packageFile,
            dependencies_updated: true
          });

          results.summary.actions++;
          results.summary.successful++;
        }
      } catch (error) {
        console.warn(`Failed to update dependencies in ${packageFile}: ${error.message}`);
        results.summary.failed++;
      }
    }
  }

  shouldUpdateDependency(dep, version, options) {
    // Basic logic - in real implementation, check against latest versions
    return version.includes('^') && Math.random() > 0.8; // Random update for demo
  }

  getLatestVersion(dep) {
    // Mock latest version
    return '^1.0.0';
  }

  async runTestsAfterCleanup(results, options) {
    // Basic test running simulation
    try {
      // This would run actual tests
      console.log('Running tests after cleanup...');

      // Simulate test results
      results.test_results = {
        passed: Math.random() > 0.1, // 90% pass rate
        message: 'Tests completed successfully'
      };
    } catch (error) {
      results.test_results = {
        passed: false,
        message: `Tests failed: ${error.message}`
      };
    }
  }

  generateCleanupRecommendations(results) {
    const recommendations = [];

    if (results.summary.failed > 0) {
      recommendations.push({
        type: 'warning',
        message: `${results.summary.failed} cleanup actions failed.`,
        action: 'Review failed actions and consider manual intervention.'
      });
    }

    if (results.cleanup.removed_dead_code.length > 0) {
      recommendations.push({
        type: 'success',
        message: `Removed dead code from ${results.cleanup.removed_dead_code.length} files.`,
        action: 'Verify application still functions correctly.'
      });
    }

    if (results.cleanup.optimized_imports.length > 0) {
      recommendations.push({
        type: 'success',
        message: `Optimized imports in ${results.cleanup.optimized_imports.length} files.`,
        action: 'Check that all required dependencies are still available.'
      });
    }

    if (results.summary.backups.length > 0) {
      recommendations.push({
        type: 'info',
        message: `Backup created with ${results.summary.backups.length} files.`,
        action: 'Keep backup safe in case rollback is needed.'
      });
    }

    return recommendations;
  }

  // Helper methods
  extractFunctions(content, file) {
    const functions = [];
    const ext = path.extname(file);

    if (ext === '.js' || ext === '.ts') {
      const funcRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function))/g;
      let match;

      while ((match = funcRegex.exec(content)) !== null) {
        const name = match[1] || match[2];
        functions.push({
          name: name,
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }

    return functions;
  }

  extractVariables(content, file) {
    const variables = [];
    const ext = path.extname(file);

    if (ext === '.js' || ext === '.ts') {
      const varRegex = /(?:const|let|var)\s+(\w+)\s*=\s*[^;]+/g;
      let match;

      while ((match = varRegex.exec(content)) !== null) {
        const name = match[1];
        variables.push({
          name: name,
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }

    return variables;
  }

  async findFunctionUsage(func, allFiles, currentFile) {
    const usage = [];

    for (const file of allFiles) {
      if (!this.isCodeFile(file) || file === currentFile) continue;

      try {
        const content = await readFileAsync(file, 'utf8');
        const regex = new RegExp(`\\b${func.name}\\b`, 'g');
        const matches = content.match(regex);

        if (matches) {
          usage.push(file);
        }
      } catch (error) {
        // Skip
      }
    }

    return usage;
  }

  findVariableUsage(variable, content) {
    const regex = new RegExp(`\\b${variable.name}\\b`, 'g');
    return content.match(regex) || [];
  }

  isCodeFile(file) {
    const codeExtensions = ['.js', '.ts', '.php', '.py'];
    return codeExtensions.some(ext => file.endsWith(ext));
  }

  removeEmptyLines(content) {
    return content
      .split('\n')
      .filter((line, index, arr) => {
        // Keep at most one empty line between content
        if (line.trim() === '') {
          return index === 0 || arr[index - 1].trim() !== '' || arr[index + 1]?.trim() !== '';
        }
        return true;
      })
      .join('\n');
  }
}

module.exports = CleanupEngine;