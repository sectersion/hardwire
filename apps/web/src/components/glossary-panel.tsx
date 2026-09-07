"use client"

import { useEffect, useMemo, useState } from "react"
import glossaryData from "@/data/glossary.json"
import { useGlossary } from "@/components/glossary-provider"

export function GlossaryPanel() {
  const { activeTermId, closeTerm } = useGlossary()
  const [isMobile, setIsMobile] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const entry = useMemo(
    () => glossaryData.find((item) => item.id === activeTermId) ?? null,
    [activeTermId]
  )

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 1024)
    updateViewport()
    window.addEventListener("resize", updateViewport)
    return () => window.removeEventListener("resize", updateViewport)
  }, [])

  useEffect(() => {
    if (!activeTermId) return
    setIsExpanded(false)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTerm()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [activeTermId, closeTerm])

  if (!entry) return null

  const preview = entry.definition.split(" ").slice(0, 18).join(" ")
  const hasMore = entry.definition.split(" ").length > 18

  return (
    <>
      <div
        className="fixed inset-0 z-[55] bg-black/70 backdrop-blur-[1px]"
        role="presentation"
        onClick={closeTerm}
      />
      <div
        className={`fixed z-[60] transition-all duration-200 ${isMobile ? "inset-x-0 bottom-0 px-3 pb-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]" : "right-4 top-1/2 w-[min(320px,calc(100vw-2rem))] -translate-y-1/2"}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${entry.term} glossary`}
      >
        <div
          className={`relative overflow-hidden border-2 bg-black shadow-[0_0_0_1px_var(--fg),0_16px_60px_rgba(0,0,0,0.45)] transition-all duration-200 ${isMobile ? "rounded-t-2xl px-4 pt-3 pb-4 max-h-[70vh]" : "rounded-none px-5 py-5"}`}
          style={{ borderColor: "var(--fg)", backgroundColor: "var(--bg)", color: "var(--fg)" }}
        >
          {isMobile ? (
            <>
              <button
                type="button"
                onClick={() => setIsExpanded((value) => !value)}
                className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full"
                style={{ backgroundColor: "var(--muted)" }}
                aria-label={isExpanded ? "Collapse glossary panel" : "Expand glossary panel"}
              />
              <div className="flex items-start justify-between gap-3 pt-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                    glossary
                  </p>
                  <h2 className="font-display text-lg font-bold break-words">{entry.term}</h2>
                </div>
                <button
                  type="button"
                  onClick={closeTerm}
                  className="shrink-0 text-xl font-bold uppercase tracking-widest"
                  style={{ color: "var(--fg)" }}
                  aria-label="Close glossary"
                >
                  ×
                </button>
              </div>
              <div className={`mt-3 space-y-3 ${isExpanded ? "max-h-[50vh] overflow-y-auto pr-1" : ""}`}>
                <p className="text-sm leading-7" style={{ color: "var(--fg)" }}>
                  {isExpanded ? entry.definition : `${preview}${hasMore ? "…" : ""}`}
                </p>
                {!isExpanded && hasMore && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "#FF1500" }}
                  >
                    read more
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={closeTerm}
                className="absolute right-3 top-3 text-xl font-bold uppercase tracking-widest"
                style={{ color: "var(--fg)" }}
                aria-label="Close glossary"
              >
                ×
              </button>
              <div className="pr-6">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  glossary
                </p>
                <h2 className="font-display text-xl font-bold mb-3">{entry.term}</h2>
                <p className="text-sm leading-7" style={{ color: "var(--fg)" }}>
                  {entry.definition}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
