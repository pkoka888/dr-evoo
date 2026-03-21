const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

class CodeAuditor {
  constructor(config = {}) {
    this.config = config;
    this.name = 'code-auditor';
    this.description = 'Comprehensive code auditing with multiple analysis types';
  }

  async execute(files, options = {}) {
    const results = {
      audit: {
        dead_code: [],
        unused_imports: [],
        circular_dependencies: [],
        code_duplication: [],
        complexity_issues: [],
        security_concerns: [],
        performance_issues: []
      },
      summary: {
        totalFiles: files.length,
        issues: 0,
        critical: 0,
        warnings: 0,
        suggestions: 0
      },
      recommendations: []
    };

    // Perform different types of audits
    if (options.check_types?.includes('dead_code') || !options.check_types) {
      results.audit.dead_code = await this.auditDeadCode(files, options);
    }

    if (options.check_types?.includes('unused_imports') || !options.check_types) {
      results.audit.unused_imports = await this.auditUnusedImports(files, options);
    }

    if (options.check_types?.includes('circular_dependencies') || !options.check_types) {
      results.audit.circular_dependencies = await this.auditCircularDependencies(files, options);
    }

    if (options.check_types?.includes('code_duplication') || !options.check_types) {
      results.audit.code_duplication = await this.auditCodeDuplication(files, options);
    }

    // Aggregate summary
    this.aggregateSummary(results);

    // Generate recommendations
    results.recommendations = this.generateAuditRecommendations(results);

    return results;
  }

  async auditDeadCode(files, options) {
    const deadCode = [];

    for (const file of files) {
      if (!this.isCodeFile(file)) continue;

      try {
        const content = await readFileAsync(file, 'utf8');
        const fileDeadCode = await this.findDeadCode(content, file, files, options);
        deadCode.push(...fileDeadCode);
      } catch (error) {
        console.warn(`Failed to audit dead code in ${file}: ${error.message}`);
      }
    }

    return deadCode;
  }

  async findDeadCode(content, file, allFiles, options) {
    const deadCode = [];
    const lines = content.split('\n');

    // Find function definitions
    const functions = this.extractFunctions(content, file);

    for (const func of functions) {
      const usage = await this.findFunctionUsage(func, allFiles, file);

      if (usage.length === 0) {
        deadCode.push({
          type: 'dead_function',
          file: file,
          name: func.name,
          line: func.line,
          severity: 'warning',
          description: `Function '${func.name}' is never used`,
          code: func.code
        });
      }
    }

    // Find unused variables
    const variables = this.extractVariables(content, file);

    for (const variable of variables) {
      const usage = this.findVariableUsage(variable, content);

      if (usage.length <= 1) { // Only the declaration
        deadCode.push({
          type: 'unused_variable',
          file: file,
          name: variable.name,
          line: variable.line,
          severity: 'info',
          description: `Variable '${variable.name}' is declared but never used`,
          code: variable.code
        });
      }
    }

    return deadCode;
  }

  extractFunctions(content, file) {
    const functions = [];
    const ext = path.extname(file);

    if (ext === '.js' || ext === '.ts') {
      // JavaScript/TypeScript functions
      const funcRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function))[\s\S]*?(?=function|const\s+\w+\s*=|class|$)/g;
      let match;

      while ((match = funcRegex.exec(content)) !== null) {
        const name = match[1] || match[2];
        const line = content.substring(0, match.index).split('\n').length;

        functions.push({
          name: name,
          line: line,
          code: match[0].trim(),
          type: 'function'
        });
      }

      // Class methods
      const methodRegex = /(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/g;
      while ((match = methodRegex.exec(content)) !== null) {
        const name = match[1];
        const line = content.substring(0, match.index).split('\n').length;

        functions.push({
          name: name,
          line: line,
          code: match[0],
          type: 'method'
        });
      }

    } else if (ext === '.php') {
      // PHP functions
      const funcRegex = /function\s+(\w+)\s*\(/g;
      let match;

      while ((match = funcRegex.exec(content)) !== null) {
        const name = match[1];
        const line = content.substring(0, match.index).split('\n').length;

        functions.push({
          name: name,
          line: line,
          code: match[0],
          type: 'function'
        });
      }

      // PHP methods
      const methodRegex = /(?:public|private|protected)\s+(?:static\s+)?function\s+(\w+)\s*\(/g;
      while ((match = methodRegex.exec(content)) !== null) {
        const name = match[1];
        const line = content.substring(0, match.index).split('\n').length;

        functions.push({
          name: name,
          line: line,
          code: match[0],
          type: 'method'
        });
      }
    }

    return functions;
  }

  extractVariables(content, file) {
    const variables = [];
    const ext = path.extname(file);

    if (ext === '.js' || ext === '.ts') {
      // JavaScript/TypeScript variables
      const varRegex = /(?:const|let|var)\s+(\w+)\s*=\s*[^;]+/g;
      let match;

      while ((match = varRegex.exec(content)) !== null) {
        const name = match[1];
        const line = content.substring(0, match.index).split('\n').length;

        variables.push({
          name: name,
          line: line,
          code: match[0],
          type: 'variable'
        });
      }
    } else if (ext === '.php') {
      // PHP variables
      const varRegex = /\$(\w+)\s*=\s*[^;]+/g;
      let match;

      while ((match = varRegex.exec(content)) !== null) {
        const name = match[1];
        const line = content.substring(0, match.index).split('\n').length;

        variables.push({
          name: name,
          line: line,
          code: match[0],
          type: 'variable'
        });
      }
    }

    return variables;
  }

  async findFunctionUsage(func, allFiles, currentFile) {
    const usage = [];

    for (const file of allFiles) {
      if (!this.isCodeFile(file)) continue;
      if (file === currentFile) continue; // Skip self-references

      try {
        const content = await readFileAsync(file, 'utf8');
        const regex = new RegExp(`\\b${func.name}\\b`, 'g');
        const matches = content.match(regex);

        if (matches) {
          usage.push({
            file: file,
            occurrences: matches.length
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return usage;
  }

  findVariableUsage(variable, content) {
    const regex = new RegExp(`\\b${variable.name}\\b`, 'g');
    const matches = content.match(regex);
    return matches || [];
  }

  async auditUnusedImports(files, options) {
    const unusedImports = [];

    for (const file of files) {
      if (!this.isCodeFile(file)) continue;

      try {
        const content = await readFileAsync(file, 'utf8');
        const fileUnusedImports = this.findUnusedImports(content, file, options);
        unusedImports.push(...fileUnusedImports);
      } catch (error) {
        console.warn(`Failed to audit imports in ${file}: ${error.message}`);
      }
    }

    return unusedImports;
  }

  findUnusedImports(content, file, options) {
    const unusedImports = [];
    const ext = path.extname(file);

    if (ext === '.js' || ext === '.ts') {
      // JavaScript/TypeScript imports
      const importRegex = /(?:import\s+.*?\s+from\s+['"]([^'"]+)['"]|import\s*\{\s*([^}]+)\s*\}\s*from\s+['"]([^'"]+)['"]|const\s+(\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1] || match[3] || match[5];
        const importedItems = match[2] ? match[2].split(',').map(item => item.trim()) : [match[4]];

        for (const item of importedItems) {
          if (item && !this.isImportUsed(item, content)) {
            unusedImports.push({
              type: 'unused_import',
              file: file,
              import: item,
              module: importPath,
              line: content.substring(0, match.index).split('\n').length,
              severity: 'info',
              description: `Import '${item}' from '${importPath}' is never used`
            });
          }
        }
      }
    } else if (ext === '.php') {
      // PHP imports/includes
      const includeRegex = /(?:include|require|include_once|require_once)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
      let match;

      while ((match = includeRegex.exec(content)) !== null) {
        const includePath = match[1];
        // For PHP, it's harder to determine if includes are used
        // This is a simplified check
        const fileName = path.basename(includePath, '.php');
        const usageRegex = new RegExp(`\\b${fileName}\\b`, 'g');

        if (!usageRegex.test(content)) {
          unusedImports.push({
            type: 'unused_include',
            file: file,
            import: includePath,
            line: content.substring(0, match.index).split('\n').length,
            severity: 'warning',
            description: `Include '${includePath}' appears unused`
          });
        }
      }
    }

    return unusedImports;
  }

  isImportUsed(importName, content) {
    const usageRegex = new RegExp(`\\b${importName}\\b`, 'g');
    const matches = content.match(usageRegex);
    return matches && matches.length > 1; // More than just the import statement
  }

  async auditCircularDependencies(files, options) {
    const circularDeps = [];
    const dependencyGraph = {};

    // Build dependency graph
    for (const file of files) {
      if (!this.isCodeFile(file)) continue;

      try {
        const content = await readFileAsync(file, 'utf8');
        const deps = this.extractDependencies(content, file);
        dependencyGraph[file] = deps;
      } catch (error) {
        console.warn(`Failed to extract dependencies from ${file}: ${error.message}`);
      }
    }

    // Detect circular dependencies
    const visited = new Set();
    const recursionStack = new Set();

    for (const file of Object.keys(dependencyGraph)) {
      if (this.hasCircularDependency(file, dependencyGraph, visited, recursionStack)) {
        circularDeps.push({
          type: 'circular_dependency',
          files: Array.from(recursionStack),
          severity: 'error',
          description: `Circular dependency detected: ${Array.from(recursionStack).join(' -> ')}`
        });
        break; // Only report first circular dependency found
      }
    }

    return circularDeps;
  }

  extractDependencies(content, file) {
    const dependencies = [];
    const ext = path.extname(file);

    if (ext === '.js' || ext === '.ts') {
      const importRegex = /(?:import\s+.*?\s+from\s+['"]([^'"]+)['"]|const\s+\w+\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const depPath = match[1] || match[2];
        if (depPath && !depPath.startsWith('.') && !depPath.startsWith('/')) {
          // Convert relative paths to absolute
          const resolvedPath = path.resolve(path.dirname(file), depPath);
          dependencies.push(resolvedPath);
        }
      }
    } else if (ext === '.php') {
      const includeRegex = /(?:include|require|include_once|require_once)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
      let match;

      while ((match = includeRegex.exec(content)) !== null) {
        const depPath = match[1];
        if (depPath && depPath.endsWith('.php')) {
          const resolvedPath = path.resolve(path.dirname(file), depPath);
          dependencies.push(resolvedPath);
        }
      }
    }

    return dependencies;
  }

  hasCircularDependency(file, graph, visited, recursionStack) {
    visited.add(file);
    recursionStack.add(file);

    const dependencies = graph[file] || [];

    for (const dep of dependencies) {
      if (!visited.has(dep)) {
        if (this.hasCircularDependency(dep, graph, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(dep)) {
        return true;
      }
    }

    recursionStack.delete(file);
    return false;
  }

  async auditCodeDuplication(files, options) {
    const duplications = [];
    const codeBlocks = new Map();

    // Extract code blocks from all files
    for (const file of files) {
      if (!this.isCodeFile(file)) continue;

      try {
        const content = await readFileAsync(file, 'utf8');
        const blocks = this.extractCodeBlocks(content, file);
        blocks.forEach(block => {
          const key = this.normalizeCode(block.code);
          if (!codeBlocks.has(key)) {
            codeBlocks.set(key, []);
          }
          codeBlocks.get(key).push({
            file: file,
            line: block.line,
            code: block.code
          });
        });
      } catch (error) {
        console.warn(`Failed to extract code blocks from ${file}: ${error.message}`);
      }
    }

    // Find duplications
    for (const [code, occurrences] of codeBlocks) {
      if (occurrences.length > 1 && code.length > 50) { // Only report significant duplications
        duplications.push({
          type: 'code_duplication',
          code: code,
          occurrences: occurrences,
          severity: 'warning',
          description: `Code block duplicated ${occurrences.length} times across files`,
          files: occurrences.map(o => `${o.file}:${o.line}`)
        });
      }
    }

    return duplications;
  }

  extractCodeBlocks(content, file) {
    const blocks = [];
    const lines = content.split('\n');

    // Extract function bodies
    const funcRegex = /(?:function\s+\w+\s*\([^)]*\)\s*\{|(\w+)\s*\([^)]*\)\s*\{)/g;
    let match;

    while ((match = funcRegex.exec(content)) !== null) {
      const startIndex = match.index + match[0].length;
      const braceCount = 1;
      let endIndex = startIndex;
      let currentBraces = 1;

      // Find matching closing brace
      for (let i = startIndex; i < content.length && currentBraces > 0; i++) {
        if (content[i] === '{') currentBraces++;
        if (content[i] === '}') currentBraces--;

        if (currentBraces === 0) {
          endIndex = i + 1;
          break;
        }
      }

      if (endIndex > startIndex) {
        const code = content.substring(startIndex, endIndex);
        const line = content.substring(0, match.index).split('\n').length;

        blocks.push({
          code: code.trim(),
          line: line,
          type: 'function'
        });
      }
    }

    return blocks;
  }

  normalizeCode(code) {
    // Normalize code for comparison (remove extra whitespace, comments, etc.)
    return code
      .replace(/\s+/g, ' ')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .trim();
  }

  isCodeFile(file) {
    const codeExtensions = ['.js', '.ts', '.php', '.py', '.java', '.cpp', '.c', '.cs'];
    return codeExtensions.some(ext => file.endsWith(ext));
  }

  aggregateSummary(results) {
    const allIssues = [
      ...results.audit.dead_code,
      ...results.audit.unused_imports,
      ...results.audit.circular_dependencies,
      ...results.audit.code_duplication
    ];

    results.summary.issues = allIssues.length;
    results.summary.critical = allIssues.filter(i => i.severity === 'error').length;
    results.summary.warnings = allIssues.filter(i => i.severity === 'warning').length;
    results.summary.suggestions = allIssues.filter(i => i.severity === 'info' || i.severity === 'suggestion').length;
  }

  generateAuditRecommendations(results) {
    const recommendations = [];

    if (results.summary.critical > 0) {
      recommendations.push({
        type: 'critical',
        message: `${results.summary.critical} critical issues found that require immediate attention.`,
        action: 'Fix critical issues before proceeding with development.'
      });
    }

    if (results.audit.dead_code.length > 0) {
      recommendations.push({
        type: 'cleanup',
        message: `${results.audit.dead_code.length} dead code instances detected.`,
        action: 'Remove unused functions and variables to improve maintainability.'
      });
    }

    if (results.audit.unused_imports.length > 0) {
      recommendations.push({
        type: 'cleanup',
        message: `${results.audit.unused_imports.length} unused imports found.`,
        action: 'Remove unused imports to reduce bundle size and dependencies.'
      });
    }

    if (results.audit.circular_dependencies.length > 0) {
      recommendations.push({
        type: 'refactor',
        message: 'Circular dependencies detected.',
        action: 'Refactor code to eliminate circular dependencies.'
      });
    }

    if (results.audit.code_duplication.length > 0) {
      recommendations.push({
        type: 'refactor',
        message: `${results.audit.code_duplication.length} code duplications found.`,
        action: 'Extract duplicated code into reusable functions or modules.'
      });
    }

    return recommendations;
  }
}

module.exports = CodeAuditor;