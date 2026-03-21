#!/usr/bin/env node
// -------------------------------------------------------------------
// Orchestrator – runs the full Docker orchestration pipeline locally.
// 1. Generate production compose
// 2. Validate it
// 3. (optional) Deploy to local Swarm if `DEPLOY=true`
// -------------------------------------------------------------------
const { execSync } = require('child_process')
const path = require('path')

function run(cmd) {
  console.log(`> ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

// 1. Generate prod compose
run('node scripts/generate-prod-compose.js')

// 2. Validate
run('node scripts/validate-compose.js')

// 3. Deploy if requested
if (process.env.DEPLOY === 'true') {
  run('docker stack deploy -c docker-compose.yml dr-evo')
}
