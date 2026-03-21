const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

class ClaimRealityValidator {
  constructor(config = {}) {
    this.config = config;
    this.name = 'claim-reality-validator';
    this.description = 'Validates that implementation matches claimed functionality';
  }

  async execute(files, options = {}) {
    const results = {
      validations: [],
      summary: {
        totalValidations: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      claims: [],
      evidence: [],
      recommendations: []
    };

    // Extract claims from various sources
    const claims = await this.extractClaims(files, options);

    // Validate each claim against implementation
    for (const claim of claims) {
      const validation = await this.validateClaim(claim, files, options);
      results.validations.push(validation);

      if (validation.status === 'passed') {
        results.summary.passed++;
      } else if (validation.status === 'failed') {
        results.summary.failed++;
      } else if (validation.status === 'warning') {
        results.summary.warnings++;
      }
    }

    results.summary.totalValidations = results.validations.length;
    results.claims = claims;

    // Generate recommendations
    results.recommendations = this.generateRecommendations(results);

    return results;
  }

  async extractClaims(files, options) {
    const claims = [];

    // Extract from documentation
    if (options.sources?.includes('docs') || options.sources?.includes('README.md')) {
      const docClaims = await this.extractFromDocumentation(files, options);
      claims.push(...docClaims);
    }

    // Extract from code comments
    if (options.sources?.includes('comments')) {
      const commentClaims = await this.extractFromComments(files, options);
      claims.push(...commentClaims);
    }

    // Extract from tests
    if (options.sources?.includes('tests')) {
      const testClaims = await this.extractFromTests(files, options);
      claims.push(...testClaims);
    }

    return claims;
  }

  async extractFromDocumentation(files, options) {
    const claims = [];

    // Look for README.md and documentation files
    const docFiles = files.filter(file =>
      file.includes('README.md') ||
      file.includes('docs/') ||
      file.includes('.md')
    );

    for (const file of docFiles) {
      try {
        const content = await readFileAsync(file, 'utf8');

        // Extract functional claims
        const functionalClaims = this.extractFunctionalClaims(content, file);
        claims.push(...functionalClaims);

        // Extract API claims
        const apiClaims = this.extractAPIClaims(content, file);
        claims.push(...apiClaims);

        // Extract performance claims
        const perfClaims = this.extractPerformanceClaims(content, file);
        claims.push(...perfClaims);

      } catch (error) {
        console.warn(`Failed to read documentation file ${file}: ${error.message}`);
      }
    }

    return claims;
  }

  extractFunctionalClaims(content, source) {
    const claims = [];
    const patterns = [
      /(?:provides?|supports?|implements?|offers?)\s+([^.?!]+?)(?:\s+(?:that|which)\s+([^.?!]*))?[.?!]/gi,
      /(?:allows?|enables?)\s+([^.?!]+?)(?:\s+(?:to|for)\s+([^.?!]*))?[.?!]/gi,
      /(?:can|will|shall)\s+([^.?!]+?)(?:\s+(?:when|if|after)\s+([^.?!]*))?[.?!]/gi
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        claims.push({
          type: 'functionality',
          claim: match[0].trim(),
          source: source,
          line: this.getLineNumber(content, match.index),
          category: 'functional'
        });
      }
    }

    return claims;
  }

  extractAPIClaims(content, source) {
    const claims = [];
    const apiPatterns = [
      /(?:API|endpoint|method|function)\s+([^.?!]+?)\s+(?:returns?|provides?|accepts?)\s+([^.?!]*)/gi,
      /(?:exposes?|offers?)\s+(?:an?\s+)?(?:API|endpoint|interface)\s+([^.?!]*)/gi
    ];

    for (const pattern of apiPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        claims.push({
          type: 'api',
          claim: match[0].trim(),
          source: source,
          line: this.getLineNumber(content, match.index),
          category: 'api_contract'
        });
      }
    }

    return claims;
  }

  extractPerformanceClaims(content, source) {
    const claims = [];
    const perfPatterns = [
      /(?:performance|speed|efficiency|fast|quick|optimized)\s+([^.?!]*)/gi,
      /(?:handles?|processes?|supports?)\s+([^.?!]+?)\s+(?:per\s+second|concurrent|simultaneous)/gi,
      /(?:response\s+time|latency|throughput)\s+(?:of|is|<|>|≈)\s+([^.?!]*)/gi
    ];

    for (const pattern of perfPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        claims.push({
          type: 'performance',
          claim: match[0].trim(),
          source: source,
          line: this.getLineNumber(content, match.index),
          category: 'performance'
        });
      }
    }

    return claims;
  }

  async extractFromComments(files, options) {
    const claims = [];

    const codeFiles = files.filter(file =>
      file.endsWith('.js') || file.endsWith('.php') || file.endsWith('.ts') || file.endsWith('.py')
    );

    for (const file of codeFiles) {
      try {
        const content = await readFileAsync(file, 'utf8');
        const commentClaims = this.extractCommentClaims(content, file);
        claims.push(...commentClaims);
      } catch (error) {
        console.warn(`Failed to read code file ${file}: ${error.message}`);
      }
    }

    return claims;
  }

  extractCommentClaims(content, source) {
    const claims = [];
    const commentPatterns = [
      // JSDoc comments
      /\/\*\*\s*\n\s*\*\s*([^@]*?)\s*\n\s*\*\s*@/gs,
      // Single line comments
      /\/\/\s*(?:TODO|FIXME|NOTE|HACK):\s*([^\/\n]*)/gi,
      // Multi-line comments
      /\/\*\s*(.*?)\s*\*\//gs,
      // PHP comments
      /#\s*(?:TODO|FIXME|NOTE|HACK):\s*([^#\n]*)/gi
    ];

    for (const pattern of commentPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const comment = match[1]?.trim();
        if (comment && this.isClaim(comment)) {
          claims.push({
            type: 'comment',
            claim: comment,
            source: source,
            line: this.getLineNumber(content, match.index),
            category: 'implementation_note'
          });
        }
      }
    }

    return claims;
  }

  isClaim(text) {
    // Check if text contains claim-like language
    const claimIndicators = [
      'provides', 'supports', 'implements', 'allows', 'enables',
      'returns', 'accepts', 'handles', 'processes', 'validates',
      'ensures', 'guarantees', 'must', 'should', 'will'
    ];

    return claimIndicators.some(indicator =>
      text.toLowerCase().includes(indicator)
    );
  }

  async extractFromTests(files, options) {
    const claims = [];

    const testFiles = files.filter(file =>
      file.includes('test') || file.includes('spec') || file.includes('Test')
    );

    for (const file of testFiles) {
      try {
        const content = await readFileAsync(file, 'utf8');
        const testClaims = this.extractTestClaims(content, file);
        claims.push(...testClaims);
      } catch (error) {
        console.warn(`Failed to read test file ${file}: ${error.message}`);
      }
    }

    return claims;
  }

  extractTestClaims(content, source) {
    const claims = [];
    const testPatterns = [
      // Jest/JS test descriptions
      /(?:describe|it|test)\s*\(\s*['"`](.*?)['"`]/gi,
      // PHPUnit test methods
      /public\s+function\s+test(\w+)\s*\(/gi,
      // Test assertions that imply functionality
      /(?:expect|assert)\s*\(\s*([^)]+)\s*\)\s*\.\s*(toBe|toEqual|toContain|toHaveLength)/gi
    ];

    for (const pattern of testPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        claims.push({
          type: 'test',
          claim: match[1] || match[0],
          source: source,
          line: this.getLineNumber(content, match.index),
          category: 'test_expectation'
        });
      }
    }

    return claims;
  }

  async validateClaim(claim, files, options) {
    const validation = {
      claim: claim.claim,
      type: claim.type,
      source: claim.source,
      status: 'unknown',
      evidence: [],
      issues: [],
      confidence: 0
    };

    try {
      switch (claim.category) {
        case 'functional':
          validation.evidence = await this.validateFunctionalClaim(claim, files);
          break;
        case 'api_contract':
          validation.evidence = await this.validateAPIClaim(claim, files);
          break;
        case 'performance':
          validation.evidence = await this.validatePerformanceClaim(claim, files);
          break;
        case 'implementation_note':
          validation.evidence = await this.validateImplementationClaim(claim, files);
          break;
        case 'test_expectation':
          validation.evidence = await this.validateTestClaim(claim, files);
          break;
        default:
          validation.evidence = await this.validateGenericClaim(claim, files);
      }

      // Determine status based on evidence
      validation.status = this.determineValidationStatus(validation.evidence);
      validation.confidence = this.calculateConfidence(validation.evidence);

    } catch (error) {
      validation.status = 'error';
      validation.issues.push(`Validation failed: ${error.message}`);
    }

    return validation;
  }

  async validateFunctionalClaim(claim, files) {
    const evidence = [];

    // Look for implementation in code files
    const codeFiles = files.filter(file =>
      file.endsWith('.js') || file.endsWith('.php') || file.endsWith('.ts')
    );

    for (const file of codeFiles) {
      try {
        const content = await readFileAsync(file, 'utf8');
        const matches = this.findFunctionalImplementation(claim.claim, content, file);
        evidence.push(...matches);
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return evidence;
  }

  findFunctionalImplementation(claim, content, file) {
    const evidence = [];
    const keywords = this.extractKeywords(claim);

    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex);

      if (matches) {
        evidence.push({
          type: 'implementation_found',
          file: file,
          keyword: keyword,
          occurrences: matches.length,
          strength: 'medium'
        });
      }
    }

    return evidence;
  }

  extractKeywords(text) {
    // Extract meaningful keywords from claim text
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    return [...new Set(words)]; // Remove duplicates
  }

  async validateAPIClaim(claim, files) {
    const evidence = [];

    // Look for API endpoints, methods, or interfaces
    const codeFiles = files.filter(file =>
      file.endsWith('.js') || file.endsWith('.php') || file.endsWith('.ts') ||
      file.includes('routes') || file.includes('api') || file.includes('controller')
    );

    for (const file of codeFiles) {
      try {
        const content = await readFileAsync(file, 'utf8');
        const apiEvidence = this.findAPIEvidence(claim.claim, content, file);
        evidence.push(...apiEvidence);
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return evidence;
  }

  findAPIEvidence(claim, content, file) {
    const evidence = [];
    const apiPatterns = [
      /route\s*\(\s*['"`](.*?)['"`]/gi,
      /app\.(get|post|put|delete|patch)\s*\(/gi,
      /function\s+(\w+)\s*\(/gi,
      /class\s+(\w+)/gi
    ];

    for (const pattern of apiPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        evidence.push({
          type: 'api_implementation',
          file: file,
          pattern: pattern.source,
          matches: matches.length,
          strength: 'high'
        });
      }
    }

    return evidence;
  }

  async validatePerformanceClaim(claim, files) {
    const evidence = [];

    // Look for performance-related code or configurations
    const perfFiles = files.filter(file =>
      file.includes('performance') || file.includes('benchmark') ||
      file.includes('cache') || file.includes('optimize')
    );

    for (const file of perfFiles) {
      try {
        const content = await readFileAsync(file, 'utf8');
        const perfEvidence = this.findPerformanceEvidence(claim.claim, content, file);
        evidence.push(...perfEvidence);
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return evidence;
  }

  findPerformanceEvidence(claim, content, file) {
    const evidence = [];
    const perfKeywords = ['cache', 'optimize', 'performance', 'benchmark', 'async', 'concurrent'];

    for (const keyword of perfKeywords) {
      if (content.toLowerCase().includes(keyword)) {
        evidence.push({
          type: 'performance_consideration',
          file: file,
          keyword: keyword,
          strength: 'medium'
        });
      }
    }

    return evidence;
  }

  async validateImplementationClaim(claim, files) {
    // Implementation claims from comments are harder to validate
    // Look for related code in the same file
    const evidence = [];

    try {
      const content = await readFileAsync(claim.source, 'utf8');
      const implEvidence = this.findImplementationEvidence(claim.claim, content, claim.source);
      evidence.push(...implEvidence);
    } catch (error) {
      // File might not exist or be readable
    }

    return evidence;
  }

  findImplementationEvidence(claim, content, file) {
    const evidence = [];
    const lines = content.split('\n');
    const claimLine = claim.line || 0;

    // Look at surrounding lines for implementation
    const startLine = Math.max(0, claimLine - 10);
    const endLine = Math.min(lines.length, claimLine + 10);
    const surroundingCode = lines.slice(startLine, endLine).join('\n');

    if (surroundingCode.length > 0) {
      evidence.push({
        type: 'context_code',
        file: file,
        lines: `${startLine + 1}-${endLine}`,
        code: surroundingCode,
        strength: 'low'
      });
    }

    return evidence;
  }

  async validateTestClaim(claim, files) {
    const evidence = [];

    // Test claims are validated by the existence of the test itself
    try {
      const content = await readFileAsync(claim.source, 'utf8');

      if (content.includes(claim.claim)) {
        evidence.push({
          type: 'test_exists',
          file: claim.source,
          strength: 'high'
        });
      }
    } catch (error) {
      // Test file might not exist
    }

    return evidence;
  }

  async validateGenericClaim(claim, files) {
    const evidence = [];

    // Generic validation - look for any mention of the claim
    for (const file of files) {
      try {
        const content = await readFileAsync(file, 'utf8');

        if (content.toLowerCase().includes(claim.claim.toLowerCase())) {
          evidence.push({
            type: 'mention_found',
            file: file,
            strength: 'low'
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return evidence;
  }

  determineValidationStatus(evidence) {
    if (evidence.length === 0) {
      return 'failed';
    }

    const strongEvidence = evidence.filter(e => e.strength === 'high');
    const mediumEvidence = evidence.filter(e => e.strength === 'medium');

    if (strongEvidence.length > 0) {
      return 'passed';
    } else if (mediumEvidence.length > 0) {
      return 'warning';
    } else {
      return 'failed';
    }
  }

  calculateConfidence(evidence) {
    if (evidence.length === 0) return 0;

    const weights = {
      'high': 1.0,
      'medium': 0.6,
      'low': 0.3
    };

    const totalWeight = evidence.reduce((sum, e) => sum + (weights[e.strength] || 0), 0);
    return Math.min(1.0, totalWeight / evidence.length);
  }

  generateRecommendations(results) {
    const recommendations = [];

    const failedValidations = results.validations.filter(v => v.status === 'failed');
    const warningValidations = results.validations.filter(v => v.status === 'warning');

    if (failedValidations.length > 0) {
      recommendations.push({
        type: 'critical',
        message: `${failedValidations.length} claims failed validation. Implementation may not match documentation.`,
        action: 'Review failed validations and update either documentation or implementation.'
      });
    }

    if (warningValidations.length > 0) {
      recommendations.push({
        type: 'warning',
        message: `${warningValidations.length} claims have weak validation evidence.`,
        action: 'Consider adding more detailed documentation or implementation evidence.'
      });
    }

    if (results.summary.passed / results.summary.totalValidations < 0.8) {
      recommendations.push({
        type: 'improvement',
        message: 'Low validation success rate detected.',
        action: 'Conduct comprehensive documentation and implementation review.'
      });
    }

    return recommendations;
  }

  getLineNumber(content, index) {
    const lines = content.substring(0, index).split('\n');
    return lines.length;
  }
}

module.exports = ClaimRealityValidator;