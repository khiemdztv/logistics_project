// Renders every ```mermaid block in WORKFLOWS.md to an SVG file in docs/workflows/.
//
//   npm run docs:diagrams
//
// Uses @mermaid-js/mermaid-cli with the Chromium already installed on the machine,
// so nothing is downloaded at run time. Install the renderer once with:
//   npm install --no-save --no-audit --no-fund @mermaid-js/mermaid-cli@11
// Chromium is located from PUPPETEER_EXECUTABLE_PATH or the usual install paths.
// Pass --png to also write a raster copy of each diagram.
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const projectDir = fileURLToPath(new URL('..', import.meta.url))
const sourceFile = path.join(projectDir, 'WORKFLOWS.md')
const outputDir = path.join(projectDir, 'docs', 'workflows')
const scratchDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dolphin-mmd-'))

const CHROMIUM_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean)

function findChromium() {
  const found = CHROMIUM_CANDIDATES.find(candidate => fs.existsSync(candidate))
  if (!found) throw new Error('No Chromium browser found. Set PUPPETEER_EXECUTABLE_PATH to chrome.exe.')
  return found
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

// Splits the markdown into one entry per fenced mermaid block, keeping its heading.
function readSections(markdown) {
  const lines = markdown.split('\n')
  const sections = []
  let heading = ''
  let buffer = null
  for (const line of lines) {
    if (/^##\s+/.test(line)) heading = line.replace(/^##\s+/, '').replace(/^\d+\.\s*/, '')
    if (/^```mermaid\s*$/.test(line)) { buffer = []; continue }
    if (buffer !== null && /^```\s*$/.test(line)) { sections.push({ heading, source: buffer.join('\n') }); buffer = null; continue }
    if (buffer !== null) buffer.push(line)
  }
  return sections
}

const markdown = fs.readFileSync(sourceFile, 'utf8')
const sections = readSections(markdown)
if (!sections.length) throw new Error('No mermaid blocks found in WORKFLOWS.md')

fs.mkdirSync(outputDir, { recursive: true })
for (const file of fs.readdirSync(outputDir)) fs.rmSync(path.join(outputDir, file), { force: true })

const chromium = findChromium()
const puppeteerConfig = path.join(scratchDir, 'puppeteer.json')
fs.writeFileSync(puppeteerConfig, JSON.stringify({
  executablePath: chromium.replace(/\\/g, '/'),
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
}))

const cli = path.join(projectDir, 'node_modules', '@mermaid-js', 'mermaid-cli', 'src', 'cli.js')
if (!fs.existsSync(cli)) {
  throw new Error('mermaid-cli is missing. Run: npm install --no-save --no-audit --no-fund @mermaid-js/mermaid-cli@11')
}

const configPath = path.join(scratchDir, 'mermaid.json')
fs.writeFileSync(configPath, JSON.stringify({
  theme: 'base',
  themeVariables: {
    fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
    fontSize: '15px',
    primaryColor: '#e0f2fe',
    primaryBorderColor: '#0284c7',
    primaryTextColor: '#0c2a44',
    lineColor: '#64748b',
    clusterBkg: '#f8fafc',
    clusterBorder: '#cbd5e1',
  },
  flowchart: { htmlLabels: true, curve: 'basis', useMaxWidth: false },
  sequence: { useMaxWidth: false, wrap: true },
}))

const used = new Map()
const manifest = []
const alsoPng = process.argv.includes('--png')
for (const [index, section] of sections.entries()) {
  const base = `${String(index + 1).padStart(2, '0')}-${slugify(section.heading) || 'diagram'}`
  const count = used.get(base) || 0
  used.set(base, count + 1)
  const name = count ? `${base}-${count + 1}` : base
  const input = path.join(scratchDir, `${name}.mmd`)
  const output = path.join(outputDir, `${name}.svg`)
  fs.writeFileSync(input, section.source, 'utf8')
  const result = spawnSync(process.execPath, [
    cli, '-i', input, '-o', output,
    '-p', puppeteerConfig, '-c', configPath, '-b', 'transparent', '-q',
  ], { cwd: projectDir, encoding: 'utf8' })
  if (result.status !== 0 || !fs.existsSync(output)) {
    console.error(result.stdout, result.stderr)
    throw new Error(`Failed to render ${name}`)
  }
  const entry = { file: `${name}.svg`, heading: section.heading }
  if (alsoPng) {
    const png = path.join(outputDir, `${name}.png`)
    const px = spawnSync(process.execPath, [
      cli, '-i', input, '-o', png, '-p', puppeteerConfig, '-c', configPath, '-b', 'white', '-w', '1600', '-q',
    ], { cwd: projectDir, encoding: 'utf8' })
    if (px.status === 0 && fs.existsSync(png)) entry.png = `${name}.png`
    else console.warn(`  (PNG skipped for ${name})`)
  }
  manifest.push(entry)
  console.log(`✔ ${name}.svg — ${section.heading}`)
}

fs.writeFileSync(path.join(outputDir, 'index.json'), `${JSON.stringify(manifest, null, 2)}\n`)
fs.rmSync(scratchDir, { recursive: true, force: true })
console.log(`\nRendered ${manifest.length} diagrams into docs/workflows/.`)
