import fs from 'node:fs'
import path from 'node:path'

export type CsvRow = Record<string, string>

export type Post = {
  pageId: string
  slug: string
  pageTitle: string
  headTerm: string
  lifeArea: string
  modifier: string
  metaDescription: string
  introduction: string
  coreContentUrl: string
  exercises: string
  faq: string
  relatedQuotes: string
  status: string
  publishedDate: string
  lastUpdated: string
}

const CSV_RELATIVE_PATH = 'books/Content Matrix-Grid view.csv'

function getCsvPath(): string {
  // Resolve relative to the project root (stoic-zenith directory)
  return path.resolve(process.cwd(), CSV_RELATIVE_PATH)
}

// Minimal RFC4180-compatible CSV parser (supports quotes and escaped quotes)
export function parseCsv(content: string): CsvRow[] {
  const rows: string[][] = []
  let current: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    const next = content[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        i++ // skip escaped quote
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        current.push(field)
        field = ''
      } else if (char === '\n' || char === '\r') {
        // Handle CRLF/CR/LF uniformly: finalize row on first break
        // If next is part of CRLF, skip it here
        if (char === '\r' && next === '\n') i++
        current.push(field)
        field = ''
        if (current.length > 1 || current[0] !== '') {
          rows.push(current)
        }
        current = []
      } else {
        field += char
      }
    }
  }
  // Flush last field/row if any
  if (field.length > 0 || inQuotes || current.length > 0) {
    current.push(field)
    rows.push(current)
  }

  if (rows.length === 0) return []
  const header = rows[0]
  const items: CsvRow[] = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (row.every((v) => v.trim() === '')) continue
    const obj: CsvRow = {}
    for (let c = 0; c < header.length; c++) {
      obj[header[c]] = row[c] ?? ''
    }
    items.push(obj)
  }
  return items
}

function safeSlug(input: string): string {
  try {
    if (input.startsWith('http')) {
      const u = new URL(input)
      const parts = u.pathname.split('/').filter(Boolean)
      return parts[parts.length - 1] || parts[parts.length - 2] || 'post'
    }
  } catch (_e) { void 0 }
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\-\s_/]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^\//, '')
}

let cache: { mtimeMs: number; posts: Post[] } | null = null

export function loadPosts(): Post[] {
  const csvPath = getCsvPath()
  const stat = fs.statSync(csvPath)
  if (cache && cache.mtimeMs === stat.mtimeMs) return cache.posts

  const raw = fs.readFileSync(csvPath, 'utf8')
  const rows = parseCsv(raw)

  const posts: Post[] = rows.map((r) => {
    const slugRaw = (r['URL_Slug'] || '').trim()
    const pageTitle = (r['Page_Title'] || '').trim()
    const metaDescription = (r['Meta_Description'] || '').trim()
    const introduction = (r['Introduction'] || '').trim()
    const lifeArea = (r['Life_Area'] || '').trim()
    const modifier = (r['Modifier'] || '').trim()
    const headTerm = (r['Head_Term'] || '').trim()
    const coreContentUrl = (r['Core_Content'] || '').trim()

    const slug = safeSlug(slugRaw || pageTitle)

    return {
      pageId: (r['Page_ID'] || '').trim(),
      slug,
      pageTitle,
      headTerm,
      lifeArea,
      modifier,
      metaDescription,
      introduction: introduction || metaDescription || pageTitle,
      coreContentUrl,
      exercises: (r['Exercises'] || '').trim(),
      faq: (r['FAQ'] || '').trim(),
      relatedQuotes: (r['Related_Quotes'] || '').trim(),
      status: (r['Status'] || '').trim(),
      publishedDate: (r['Published_Date'] || '').trim(),
      lastUpdated: (r['Last_Updated'] || '').trim(),
    }
  })
  // Filter out items without a slug
  .filter((p) => !!p.slug)

  cache = { mtimeMs: stat.mtimeMs, posts }
  return posts
}

export function getAllPosts(): Post[] {
  return loadPosts()
}

export function getPostBySlug(slug: string): Post | undefined {
  const posts = loadPosts()
  return posts.find((p) => p.slug === slug)
}

export function siteUrl(pathname: string = ''): string {
  // Use the main domain
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://thewaystoic.site'
  if (!pathname) return base
  return `${base}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
}

