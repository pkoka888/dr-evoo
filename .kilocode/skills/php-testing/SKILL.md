---
name: php-testing
description: Toolkit for testing PHP applications including unit testing, integration testing, and browser automation for PHP apps. Use when working with PHP projects that need test coverage verification or debugging.
license: MIT
metadata:
  category: development
  source:
    repository: https://github.com/okamih/kilo-code-skills
    path: php-testing
---

# PHP Testing

Test PHP applications using PHPUnit, Pest, and browser automation tools.

## What I Can Do

- **Write and run PHPUnit tests** for PHP applications
- **Run Pest PHP tests** for modern PHP testing syntax
- **Execute Laravel tests** including feature tests and unit tests
- **Run browser tests** using Laravel Dusk for end-to-end testing
- **Create test fixtures and factories** for test data
- **Mock dependencies** using PHPUnit mocking tools
- **Debug failing tests** and analyze test output
- **Run specific test suites** or individual test methods
- **Generate code coverage reports** for PHP projects

## Limitations

- Cannot run PHP tests without PHP runtime and dependencies installed
- Browser automation (Dusk) requires Chrome/Chromium to be installed
- Some tests may require database setup or seeders to run first
- Coverage reports require Xdebug or PCOV extension

## Common Commands and Tools

### PHPUnit
```bash
# Run all tests
./vendor/bin/phpunit

# Run specific test file
./vendor/bin/phpunit tests/Unit/UserTest.php

# Run tests matching pattern
./vendor/bin/phpunit --filter=testUserCanLogin

# Run with coverage
./vendor/bin/phpunit --coverage-html coverage
```

### Pest PHP
```bash
# Run all tests
./vendor/bin/pest

# Run specific test
./vendor/bin/pest tests/Unit/UserTest.php

# Run with coverage
./vendor/bin/pest --coverage
```

### Laravel Dusk (Browser Testing)
```bash
# Run Dusk tests
php artisan dusk

# Run specific Dusk test
php artisan dusk tests/Browser/LoginTest.php

# Install Dusk
php artisan dusk:install
```

### Composer and PHP
```bash
# Install dependencies
composer install

# Run Composer scripts
composer test

# Check PHP version
php -v
```

## Best Practices

1. Use descriptive test method names that explain what is being tested
2. Follow AAA pattern: Arrange, Act, Assert
3. Mock external dependencies to keep tests fast and isolated
4. Run tests locally before committing to catch failures early
5. Use data providers for testing multiple input scenarios
6. Keep tests independent - each test should run in any order
