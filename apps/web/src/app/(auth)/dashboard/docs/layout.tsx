import { getDocsTree } from "@/lib/docs"
import { DocsSidebar } from "@/components/docs-sidebar"
import { PageTransition } from "@/components/page-transition"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const { tree } = getDocsTree()

  return (
    <div className="flex">
      <aside
        className="w-64 shrink-0 border-r-2 px-4 py-8 sticky top-0 h-screen overflow-y-auto"
        style={{ borderColor: "var(--fg)" }}
      >
        <h1 className="font-display text-xl font-bold lowercase mb-6 px-2">
          docs<span style={{ color: "#FF1500" }}>.</span>
        </h1>
        <DocsSidebar tree={tree} />
      </aside>
      <div className="flex-1 min-w-0 px-8 py-12 max-w-3xl">
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  )
}