---
name: security-analysis
description: Toolkit for analyzing code security vulnerabilities, identifying potential security issues, and performing security audits. Use when users need to check code for security vulnerabilities or perform security reviews.
license: MIT
metadata:
  category: security
  source:
    repository: https://github.com/okamih/kilo-code-skills
    path: security-analysis
---

# Security Analysis

Analyze code for security vulnerabilities and perform security audits.

## What I Can Do

- **Identify common vulnerabilities** such as SQL injection, XSS, CSRF
- **Scan for insecure dependencies** with known vulnerabilities
- **Analyze authentication and authorization** implementations
- **Check for sensitive data exposure** in code or configs
- **Review API security** including input validation and rate limiting
- **Audit configuration files** for security misconfigurations
- **Perform static code analysis** for security issues
- **Check for insecure coding patterns** in various languages
- **Review environment variables** and secrets handling

## Limitations

- Cannot perform dynamic security testing without running the application
- Cannot access external vulnerability databases without network access
- Analysis is limited to code that can be read from the workspace
- Cannot test for all possible vulnerability types
- False positives may occur and require manual review

## Common Tools and Commands

### Dependency Scanning
```bash
# npm audit
npm audit
npm audit fix

# yarn audit
yarn audit

# PHP Composer audit
composer audit

# pip audit (Python)
pip-audit
```

### Static Analysis
```bash
# ESLint with security rules
npx eslint --ext .js,.ts --rule 'no-console:error'

# PHPStan
./vendor/bin/phpstan analyse

# SonarQube (if configured)
sonar-scanner

# Bandit (Python)
bandit -r .
```

### Secret Detection
```bash
# GitLeaks
gitleaks detect

# TruffleHog
trufflehog filesystem .

# Scan for secrets in code
grep -r "password\s*=" --include="*.php"
grep -r "api_key" --include="*.js"
```

### Security Linting
```bash
# Node.js security tools
npx auditjs

# PHP CS Security
phpcs --standard=PHP-Security

# GoSec (Go)
gosec ./...
```

## Common Vulnerability Patterns to Look For

### SQL Injection
- Unsanitized user input in database queries
- String concatenation in SQL statements
- Using user data directly in queries

### XSS (Cross-Site Scripting)
- Unescaped user input in HTML
- Using innerHTML with user data
- Missing Content-Security-Policy headers

### Authentication Issues
- Hardcoded credentials
- Weak password hashing
- Missing rate limiting on login
- Session fixation issues

### Sensitive Data Exposure
- API keys in source code
- Credentials in config files
- Sensitive data in logs
- Unencrypted data transmission

## Best Practices

1. Always use parameterized queries for database operations
2. Validate and sanitize all user inputs
3. Use environment variables for secrets, never hardcode them
4. Implement proper authentication and authorization checks
5. Enable security headers in web responses
6. Keep dependencies up to date to patch known vulnerabilities
7. Follow principle of least privilege
