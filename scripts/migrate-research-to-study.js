const fs = require('fs')
const path = require('path')
const RESEARCH_ROOT = path.join(__dirname, '..', 'plans', 'research')
const STUDIES_ROOT = path.join(__dirname, '..', 'plans', 'studies')
const LOG_DIR = path.join(__dirname, '..', 'logs', 'researches')
const LOG_FILE = path.join(LOG_DIR, 'migration.log')
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true })
function log(msg) {
  const ts = new Date().toISOString()
  fs.appendFileSync(LOG_FILE, `[${ts}] ${msg}\n`)
  console.log(msg)
}
const CATEGORY_MAP = {
  payments: ['comgate', 'stripe', 'payment', 'openbanking'],
  logistics: ['zasilkovna', 'baselinker', 'gls', 'shipping'],
  analytics: ['google-analytics', 'heureka', 'analytics'],
  security: ['security', 'compliance', 'gdpr', 'oauth'],
  infrastructure: ['minio', 'postgres', 'n8n', 'redis', 'docker'],
  integration: ['integration', 'hub', 'pattern', 'api'],
  storefront: ['ui', 'ux', 'nextjs', 'react', 'three', 'accessibility'],
  'product-modeling': [
    'product-model',
    'attribute',
    'variant',
    'custom',
    'saleor-mcp',
  ],
}
function detectCategory(topic) {
  const lower = topic.toLowerCase()
  for (const cat of Object.keys(CATEGORY_MAP)) {
    if (CATEGORY_MAP[cat].some((k) => lower.includes(k))) return cat
  }
  return 'uncategorized'
}
function buildFrontMatter(meta) {
  return `---\ntitle: "${meta.title}"\ntopic: "${meta.topic}"\ncategory: "${meta.category}"\nstatus: "${meta.status}"\ndecision_deadline: "${meta.decision_deadline}"\ncreated: "${meta.created}"\nlast_modified: "${meta.last_modified}"\nauthors:\n  - "${meta.author}"\n---\n\n`
}
function migrate() {
  const files = fs.readdirSync(RESEARCH_ROOT).filter((f) => f.endsWith('.md'))
  if (files.length === 0) {
    log('✅ No research files to migrate.')
    return
  }
  files.forEach((file) => {
    const raw = fs.readFileSync(path.join(RESEARCH_ROOT, file), 'utf8')
    const titleMatch = raw.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : file.replace('.md', '')
    const topic = file.replace(/^research-/, '').replace(/\.md$/, '')
    const category = detectCategory(topic)
    const now = new Date().toISOString().split('T')[0]
    const meta = {
      title,
      topic,
      category,
      status: 'draft',
      decision_deadline: now,
      created: now,
      last_modified: now,
      author: process.env.USER || 'automation',
    }
    const content = buildFrontMatter(meta) + `## Findings\n\n${raw.trim()}\n`
    const destDir = path.join(STUDIES_ROOT, category)
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })
    const destPath = path.join(destDir, `study-${topic}-draft.md`)
    fs.writeFileSync(destPath, content, 'utf8')
    log(`📄 Migrated ${file} → ${path.relative(process.cwd(), destPath)}`)
  })
  log(`✅ Migration completed. ${files.length} file(s) processed.`)
}
migrate()
