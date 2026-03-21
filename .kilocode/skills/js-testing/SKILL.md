---
name: js-testing
description: Toolkit for testing JavaScript and Node.js applications including unit testing, integration testing, end-to-end testing with Playwright, and test automation. Use when working with JavaScript/TypeScript projects that need test coverage or debugging.
license: MIT
metadata:
  category: development
  source:
    repository: https://github.com/okamih/kilo-code-skills
    path: js-testing
---

# JavaScript/Node.js Testing

Test JavaScript and Node.js applications using Jest, Vitest, Mocha, and Playwright.

## What I Can Do

- **Write and run Jest tests** for JavaScript/TypeScript applications
- **Execute Vitest tests** for modern Vite-based projects
- **Run Mocha tests** with various assertion libraries
- **Perform end-to-end testing** with Playwright
- **Test React components** using React Testing Library
- **Test Vue components** using Vue Test Utils
- **Mock modules and functions** using jest.mock or vitest.mock
- **Run component snapshot tests** to detect UI changes
- **Generate test coverage reports** in various formats
- **Debug tests** with interactive debugging tools
- **Run tests in watch mode** for development

## Limitations

- Cannot run tests without Node.js and required dependencies installed
- Browser-based tests (Playwright) require browser binaries
- Coverage reports may require additional configuration
- Some tests may require environment variables or database setup

## Common Commands and Tools

### Jest
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- UserService.test.js

# Run tests matching pattern
npm test -- --testNamePattern="login"

# Run with coverage
npm test -- --coverage

# Run CI mode (single run)
npm test -- --ci
```

### Vitest
```bash
# Run all tests
npx vitest

# Run in watch mode
npx vitest --watch

# Run specific file
npx vitest run UserService.test.ts

# Run with coverage
npx vitest --coverage
```

### Playwright (E2E Testing)
```bash
# Install Playwright browsers
npx playwright install

# Run Playwright tests
npx playwright test

# Run specific test file
npx playwright test tests/login.spec.ts

# Open Playwright UI
npx playwright test --ui

# Generate tests
npx playwright codegen
```

### npm Scripts
```bash
# Check package.json for available test scripts
npm run

# Run custom test command
npm run test:unit
npm run test:e2e
npm run test:coverage
```

## Best Practices

1. Use descriptive test names that explain expected behavior
2. Follow AAA pattern: Arrange, Act, Assert
3. Keep tests focused on single behavior
4. Mock external APIs and services for fast, reliable tests
5. Use meaningful assertions rather than just checking truthiness
6. Run tests before committing to catch regressions early
7. Use testing-library principles: test behavior, not implementation
