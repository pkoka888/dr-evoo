#!/usr/bin/env node
// -------------------------------------------------------------------
// Generates a production‑ready docker‑compose.yml by merging the dev compose
// with secret and image overrides.
// -------------------------------------------------------------------
const fs = require('fs')
const path = require('path')

// Paths
const DEV_COMPOSE = path.join(__dirname, '..', 'docker-compose.dev.yml')
const PROD_COMPOSE = path.join(__dirname, '..', 'docker-compose.yml')

// Helper: detect placeholder values that should become Docker secrets
function isPlaceholder(value) {
  return (
    typeof value === 'string' &&
    /^(your-|define\/verify|<REDACTED>)/i.test(value)
  )
}

// Load dev compose as raw text
let devContent
try {
  devContent = fs.readFileSync(DEV_COMPOSE, 'utf8')
} catch (e) {
  console.error('❌ Cannot read dev compose:', e.message)
  process.exit(1)
}

const lines = devContent.split('\n')
const outLines = []
let currentService = null
const secretNames = new Set()

for (let i = 0; i < lines.length; i++) {
  let line = lines[i]

  // Detect start of a service block (e.g. "    saleor-api:")
  const serviceMatch = line.match(/^(\s{4})(\w+):\s*$/)
  if (serviceMatch) {
    currentService = serviceMatch[2]
    outLines.push(line)
    continue
  }

  // Inside a service – replace image definitions with templated reference
  if (currentService && line.match(/^\s{6}image:/)) {
    const tmpl = `      image: ${process.env.DOCKER_REGISTRY || 'registry.example.com'}/${currentService}:${process.env.VERSION || 'latest'}`
    outLines.push(tmpl)
    continue
  }

  // Replace placeholder environment values with secret file refs
  const envMatch = line.match(/^\s{6}([A-Z_]+)=(["']?)(.*)\2$/)
  if (envMatch && isPlaceholder(envMatch[3])) {
    const varName = envMatch[1]
    const secretRef = `      - ${varName}FILE=/run/secrets/${varName.toLowerCase()}`
    outLines.push(secretRef)
    secretNames.add(varName.toLowerCase())
    continue
  }

  // Default – copy line unchanged
  outLines.push(line)
}

// Append top‑level secrets block if any secret refs were added
if (secretNames.size) {
  outLines.push('secrets:')
  secretNames.forEach((name) => {
    outLines.push(`  ${name}:`)
    outLines.push('    external: true')
  })
}

// Write the final compose file
try {
  fs.writeFileSync(PROD_COMPOSE, outLines.join('\n'), 'utf8')
  console.log('✅ Produced production docker-compose.yml')
} catch (e) {
  console.error('❌ Failed to write production compose:', e.message)
  process.exit(1)
}
