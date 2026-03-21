---
name: performance-profiling
description: Toolkit for profiling application performance, identifying bottlenecks, and optimizing code execution. Use when users need to analyze application performance, debug slow operations, or optimize resource usage.
license: MIT
metadata:
  category: development
  source:
    repository: https://github.com/okamih/kilo-code-skills
    path: performance-profiling
---

# Performance Profiling

Profile application performance, identify bottlenecks, and optimize code execution.

## What I Can Do

- **Profile JavaScript/Node.js applications** using built-in profilers
- **Analyze PHP performance** with Xdebug or other profiling tools
- **Measure API response times** and identify slow endpoints
- **Analyze bundle sizes** for frontend applications
- **Identify database query bottlenecks** and N+1 query problems
- **Monitor memory usage** and detect memory leaks
- **Analyze render performance** for React/Vue applications
- **Profile build times** and optimize build configuration
- **Run load tests** to simulate concurrent users

## Limitations

- Cannot profile without the application being runnable
- Some profiling tools require specific extensions or configurations
- Performance measurements may vary between environments
- Profiling adds overhead which may affect timing accuracy

## Common Tools and Commands

### Node.js Profiling
```bash
# Built-in Node.js profiler
node --prof app.js
node --prof-process isolate*.log

# Clinic.js
npx clinic doctor -- node app.js
npx clinic flame -- node app.js
npx clinic bubbleprof -- node app.js

# 0x (flame graphs)
npx 0x app.js
```

### Browser DevTools
``` Chrome DevTools Performance tab
- Record performance during interactions
- Analyze flame charts
- Identify slow functions
- Measure Core Web Vitals
```

### PHP Profiling
```bash
# Xdebug profiling
php -d xdebug.mode=profile -d xdebug.output_dir=/tmp app.php

# Blackfire (if configured)
blackfire run php app.php

# Laravel Telescope (development)
# Access via /_telescope route
```

### Database Query Analysis
```bash
# MySQL slow query log
# Check slow_query_log in MySQL config

# Laravel query log
DB::listen(function($query) { 
    logger($query->sql, $query->bindings); 
});

# Eloquent query logging
\LaravelDebugbar::addQuery($query);
```

### Frontend Performance
```bash
# Lighthouse CLI
npx lighthouse https://example.com --output=json

# WebPageTest
npx wpt https://example.com

# Bundle analysis
npm run build -- --analyze
npx webpack-bundle-analyzer
```

### Load Testing
```bash
# k6
k6 run script.js

# Apache Bench
ab -n 1000 -c 10 https://example.com/

# wrt
wrk -t12 -c400 -d30s https://example.com/
```

## Common Performance Issues

### Frontend
- Large bundle sizes
- Unnecessary re-renders
- Blocking scripts
- Unoptimized images
- Missing code splitting

### Backend
- N+1 database queries
- Missing database indexes
- Inefficient algorithms
- Unoptimized caching
- Memory leaks

### Network
- Too many HTTP requests
- Large response payloads
- Missing compression
- Unoptimized assets

## Best Practices

1. Measure performance before optimizing - don't guess
2. Focus on the biggest bottlenecks first
3. Use caching appropriately at multiple levels
4. Optimize database queries and add indexes
5. Implement lazy loading for heavy resources
6. Monitor performance in production environments
7. Use profiling data to guide optimization efforts
8. Test with realistic data volumes
