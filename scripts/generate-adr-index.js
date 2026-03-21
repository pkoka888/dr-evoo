const fs = require('fs')
const path = require('path')

const ADR_DIR = path.join(__dirname, '../adr')
const INDEX_FILE = path.join(ADR_DIR, 'README.md')

const STATUS_BADGES = {
  waiting: '⚪ waiting',
  draft: '🟡 draft',
  reviewed: '🔵 reviewed',
  approved: '🟢 approved',
  rejected: '🔴 rejected',
  archived: '🟤 archived',
}

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  const entries = fs.readdirSync(dir)
  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    if (fs.statSync(fullPath).isDirectory()) {
      if (entry !== 'README.md') getFiles(fullPath, files)
    } else if (entry.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  return files
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null
  const lines = match[1].split('\n')
  const data = {}
  for (const line of lines) {
    const [key, ...rest] = line.split(':')
    if (key && rest.length) {
      data[key.trim()] = rest
        .join(':')
        .replace(/[\'\"]/g, '')
        .trim()
    }
  }
  return data
}

function generateIndex() {
  console.log('🔍 Scanning ADR directory...')
  const files = getFiles(ADR_DIR)
  const categorized = {}
  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8')
    const meta = parseFrontmatter(content)
    if (meta && meta.category && meta.title && meta.status) {
      const cat = meta.category
      if (!categorized[cat]) categorized[cat] = []
      const relative = path.relative(ADR_DIR, file).replace(/\\/g, '/')
      categorized[cat].push({
        title: meta.title,
        topic: meta.topic || 'unknown',
        status: meta.status.toLowerCase(),
        link: relative,
        date: meta.last_modified || meta.created || 'N/A',
      })
    }
  })

  let md = '# 📚 Architecture Decision Records Index\n\n'
  md += `*Auto‑generated on: ${new Date().toISOString().split('T')[0]}*\n\n`
  md +=
    '> **Status Legend:** ⚪ Waiting | 🟡 Draft | 🔵 Reviewed | 🟢 Approved | 🔴 Rejected | 🟤 Archived\n\n---\n\n'

  const categories = Object.keys(categorized).sort()
  categories.forEach((cat) => {
    md += `## 📂 ${cat.toUpperCase()}\n\n`
    md += '| Status | Topic / Title | Last Modified |\n'
    md += '|---|---|---|\n'
    const items = categorized[cat].sort((a, b) =>
      a.topic.localeCompare(b.topic),
    )
    items.forEach((it) => {
      const badge = STATUS_BADGES[it.status] || `❔ ${it.status}`
      md += `| ${badge} | [**${it.title}**](${it.link}) | ${it.date} |\n`
    })
    md += '\n'
  })

  fs.writeFileSync(INDEX_FILE, md)
  console.log(`✅ Generated ADR index with ${files.length} records.`)
}

generateIndex()
