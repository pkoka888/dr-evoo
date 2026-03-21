const fs = require('fs')
const path = require('path')
const STUDIES_DIR = path.join(__dirname, '../plans/studies')
const INDEX_FILE = path.join(STUDIES_DIR, 'index/STUDIES_INDEX.md')
// Emoji mapping for statuses
const STATUS_BADGES = {
  waiting: '⚪ waiting',
  draft: '🟡 draft',
  reviewed: '🔵 reviewed',
  approved: '🟢 approved',
  archived: '🟤 archived',
}
// Helper: Recursively get all markdown files
function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  const list = fs.readdirSync(dir)
  for (const file of list) {
    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'index') getFiles(filePath, files)
    } else if (file.endsWith('.md')) {
      files.push(filePath)
    }
  }
  return files
}
// Helper: Parse basic YAML frontmatter
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null
  const lines = match[1].split('\n')
  const data = {}
  lines.forEach((line) => {
    const [key, ...valueParts] = line.split(':')
    if (key && valueParts.length) {
      data[key.trim()] = valueParts
        .join(':')
        .replace(/[\'\"]/g, '')
        .trim()
    }
  })
  return data
}
function generateIndex() {
  console.log('🔍 Scanning studies directory...')
  const files = getFiles(STUDIES_DIR)
  const categorizedStudies = {}
  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8')
    const meta = parseFrontmatter(content)
    if (meta && meta.category && meta.title && meta.status) {
      if (!categorizedStudies[meta.category]) {
        categorizedStudies[meta.category] = []
      }
      const relativePath = path
        .relative(path.join(STUDIES_DIR, 'index'), file)
        .replace(/\\/g, '/')
      categorizedStudies[meta.category].push({
        title: meta.title,
        topic: meta.topic || 'unknown',
        status: meta.status.toLowerCase(),
        link: relativePath,
        date: meta.last_modified || meta.created || 'N/A',
      })
    }
  })
  // Build the Markdown content
  let mdContent = `# 📚 Architecture Study Library Index\n\n`
  mdContent += `*Auto-generated on: ${new Date().toISOString().split('T')[0]}*\n\n`
  mdContent += `> **Status Legend:** ⚪ Waiting | 🟡 Draft | 🔵 Reviewed | 🟢 Approved | 🟤 Archived\n\n---\n\n`
  const categories = Object.keys(categorizedStudies).sort()
  categories.forEach((category) => {
    mdContent += `## 📂 ${category.toUpperCase()}\n\n`
    mdContent += `| Status | Topic / Title | Last Modified |\n`
    mdContent += `|---|---|---|\n`
    const studies = categorizedStudies[category].sort((a, b) =>
      a.topic.localeCompare(b.topic),
    )
    studies.forEach((study) => {
      const badge = STATUS_BADGES[study.status] || `❔ ${study.status}`
      mdContent += `| ${badge} | [**${study.title}**](${study.link}) | ${study.date} |\n`
    })
    mdContent += `\n`
  })
  // Ensure the index directory exists
  const indexDir = path.dirname(INDEX_FILE)
  if (!fs.existsSync(indexDir)) {
    fs.mkdirSync(indexDir, { recursive: true })
  }
  fs.writeFileSync(INDEX_FILE, mdContent)
  console.log(
    `✅ Successfully generated STUDIES_INDEX.md with ${files.length} records.`,
  )
}

generateIndex()
