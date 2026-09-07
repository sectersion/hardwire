import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import glossaryData from "../src/data/glossary.json"

const docsRoot = path.join(process.cwd(), "content", "docs")
const glossaryTerms = glossaryData.map((entry) => ({
  id: entry.id,
  term: entry.term,
}))

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function wrapText(content: string): string {
  const lines = content.split(/\n/)
  const output: string[] = []
  const usedTerms = new Set<string>()
  let inFence = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (/^```/.test(trimmed)) {
      inFence = !inFence
      output.push(line)
      continue
    }

    if (inFence || /^\s{0,3}#{1,3}\s/.test(line) || line.includes("<Term") || line.includes("[") && line.includes("](")) {
      output.push(line)
      continue
    }

    let wrapped = line
    for (const term of glossaryTerms) {
      if (usedTerms.has(term.id)) continue
      const regex = new RegExp(`\\b${escapeRegex(term.term)}\\b`, "gi")
      if (!regex.test(wrapped)) continue
      regex.lastIndex = 0
      wrapped = wrapped.replace(regex, (match) => `<Term id="${term.id}">${match}</Term>`)
      usedTerms.add(term.id)
    }

    output.push(wrapped)
  }

  return output.join("\n")
}

function walk(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const raw = fs.readFileSync(fullPath, "utf-8")
      const parsed = matter(raw)
      const updated = wrapText(parsed.content)
      if (updated !== parsed.content) {
        const next = matter.stringify(updated, parsed.data)
        fs.writeFileSync(fullPath, next)
        console.log(`updated ${path.relative(process.cwd(), fullPath)}`)
      }
    }
  }
}

walk(docsRoot)
