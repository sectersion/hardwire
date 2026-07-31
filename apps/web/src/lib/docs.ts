import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { marked } from "marked"

const DOCS_ROOT = path.join(process.cwd(), "content", "docs")

export interface DocPageNode {
  type: "page"
  title: string
  slug: string[]
}

export interface DocCategoryNode {
  type: "category"
  title: string
  slug: string[]
  children: DocNode[]
}

export type DocNode = DocPageNode | DocCategoryNode

// "03-getting-started" -> "getting started", "t1-digital-logic" -> "t1 digital logic"
// Strips a leading numeric ordering prefix like "01-" but leaves the rest intact.
function cleanName(raw: string): string {
  return raw.replace(/^\d+-/, "")
}

function toTitle(cleaned: string): string {
  return cleaned
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// Builds the nested tree AND a flat lookup map (slug path -> real filesystem path)
// in one walk, so the [...slug] route doesn't need to re-derive fs paths itself.
function walk(dir: string, slugPrefix: string[], flatMap: Map<string, string>): DocNode[] {
  if (!fs.existsSync(dir)) return []

  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() || e.name.endsWith(".md"))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

  const nodes: DocNode[] = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const cleaned = cleanName(entry.name)
      const slug = [...slugPrefix, cleaned]
      const children = walk(path.join(dir, entry.name), slug, flatMap)
      if (children.length === 0) continue // skip empty category folders
      nodes.push({ type: "category", title: toTitle(cleaned), slug, children })
    } else {
      const cleaned = cleanName(entry.name.replace(/\.md$/, ""))
      const slug = [...slugPrefix, cleaned]
      const fsPath = path.join(dir, entry.name)

      // Frontmatter title overrides the filename-derived one, if present.
      const raw = fs.readFileSync(fsPath, "utf-8")
      const { data } = matter(raw)
      const title = data.title || toTitle(cleaned)

      flatMap.set(slug.join("/"), fsPath)
      nodes.push({ type: "page", title, slug })
    }
  }

  return nodes
}

export function getDocsTree(): { tree: DocNode[]; flatMap: Map<string, string> } {
  const flatMap = new Map<string, string>()
  const tree = walk(DOCS_ROOT, [], flatMap)
  return { tree, flatMap }
}

export function getDocBySlug(slugArray: string[]): { title: string; html: string } | null {
  const { flatMap } = getDocsTree()
  const fsPath = flatMap.get(slugArray.join("/"))
  if (!fsPath) return null

  const raw = fs.readFileSync(fsPath, "utf-8")
  const { data, content } = matter(raw)
  const title = data.title || toTitle(cleanName(path.basename(fsPath, ".md")))
  const html = marked.parse(content) as string

  return { title, html }
}

// The first real page in the tree — used so /docs can redirect somewhere useful
// instead of showing an empty page.
export function getFirstDocSlug(nodes: DocNode[] = getDocsTree().tree): string[] | null {
  for (const node of nodes) {
    if (node.type === "page") return node.slug
    const found = getFirstDocSlug(node.children)
    if (found) return found
  }
  return null
}