"use client"

import { useState } from "react"
import { DocsSidebar } from "@/components/docs-sidebar"

const ACCENT = "#FF1500"

export function DocsMobileShell({
  tree,
  children,
}: {
  tree: Parameters<typeof DocsSidebar>[0]["tree"]
  children: React.ReactNode
}) {
  const [view, setView] = useState<"nav" | "content">("content")

  return (
    <div className="flex relative">
      <aside
        className={`${view === "nav" ? "block" : "hidden"} md:block w-full md:w-64 shrink-0 border-r-2 px-4 py-6 md:py-8 md:sticky md:top-0 md:h-screen overflow-y-auto`}
        style={{ borderColor: "var(--fg)" }}
      >
        <h1 className="font-display text-xl font-bold lowercase mb-6 px-2">
          docs<span style={{ color: ACCENT }}>.</span>
        </h1>
        <DocsSidebar tree={tree} />
      </aside>

      <div
        className={`${view === "content" ? "block" : "hidden"} md:block flex-1 min-w-0 px-4 py-8 md:px-8 md:py-12 max-w-3xl pb-24 md:pb-12`}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => setView(view === "nav" ? "content" : "nav")}
        className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 border-2 px-5 py-3 text-xs font-bold uppercase tracking-widest"
        style={{ borderColor: ACCENT, backgroundColor: "var(--bg)", color: ACCENT }}
      >
        {view === "nav" ? "view page →" : "← browse docs"}
      </button>
    </div>
  )
}