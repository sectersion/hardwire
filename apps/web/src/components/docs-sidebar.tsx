"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { DocNode } from "@/lib/docs"

const ACCENT = "#FF1500"

function CategoryItem({ node, depth }: { node: Extract<DocNode, { type: "category" }>; depth: number }) {
  const pathname = usePathname()
  const containsActive = flattenSlugs(node).some((s) => pathname === `/dashboard/docs/${s.join("/")}`)
  const [open, setOpen] = useState(containsActive || depth === 0)

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-widest py-2"
        style={{ color: "var(--muted)", paddingLeft: `${depth * 12}px` }}
      >
        {node.title}
        <span>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div>
          {node.children.map((child) => (
            <NavNode key={child.slug.join("/")} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function PageItem({ node, depth }: { node: Extract<DocNode, { type: "page" }>; depth: number }) {
  const pathname = usePathname()
  const href = `/dashboard/docs/${node.slug.join("/")}`
  const active = pathname === href

  return (
    <Link
      href={href}
      className="block text-sm py-1.5"
      style={{
        paddingLeft: `${depth * 12}px`,
        color: active ? ACCENT : "var(--fg)",
        fontWeight: active ? 700 : 400,
      }}
    >
      {node.title}
    </Link>
  )
}

function NavNode({ node, depth }: { node: DocNode; depth: number }) {
  if (node.type === "category") return <CategoryItem node={node} depth={depth} />
  return <PageItem node={node} depth={depth} />
}

function flattenSlugs(node: DocNode): string[][] {
  if (node.type === "page") return [node.slug]
  return node.children.flatMap(flattenSlugs)
}

export function DocsSidebar({ tree }: { tree: DocNode[] }) {
  return (
    <nav>
      {tree.map((node) => (
        <NavNode key={node.slug.join("/")} node={node} depth={0} />
      ))}
    </nav>
  )
}