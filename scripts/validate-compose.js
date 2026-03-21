#!/usr/bin/env node
// -------------------------------------------------------------------
// Validate the generated production docker-compose.yml.
// Exits with code 0 if the compose file is valid, otherwise prints errors.
// -------------------------------------------------------------------
const { execSync } = require('child_process')
const path = require('path')
const composeFile = path.join(__dirname, '..', 'docker-compose.yml')

try {
  execSync(`docker compose -f "${composeFile}" config`, { stdio: 'inherit' })
  console.log('✅ docker-compose.yml is valid')
  process.exit(0)
} catch (e) {
  console.error('❌ docker-compose.yml validation failed')
  process.exit(1)
}
