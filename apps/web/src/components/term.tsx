"use client"

import { useMemo } from "react"
import glossaryData from "@/data/glossary.json"
import { useGlossary } from "@/components/glossary-provider"

function isGlossaryEntry(id: string): boolean {
  return glossaryData.some((entry) => entry.id === id)
}

export function Term({ id, children }: { id: string; children: React.ReactNode }) {
  const { openTerm } = useGlossary()
  const entry = useMemo(
    () => glossaryData.find((item) => item.id === id),
    [id]
  )

  if (!entry) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[glossary] Missing entry for term id: ${id}`)
    }
    return <span>{children}</span>
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    openTerm(id)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      event.stopPropagation()
      openTerm(id)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="inline border-b-2 border-dotted align-baseline transition-colors"
      style={{ borderColor: "var(--muted)", color: "inherit" }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = "#FF1500"
        event.currentTarget.style.color = "#FF1500"
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = "var(--muted)"
        event.currentTarget.style.color = "inherit"
      }}
      onFocus={(event) => {
        event.currentTarget.style.borderColor = "#FF1500"
        event.currentTarget.style.color = "#FF1500"
      }}
      onBlur={(event) => {
        event.currentTarget.style.borderColor = "var(--muted)"
        event.currentTarget.style.color = "inherit"
      }}
    >
      {children}
    </button>
  )
}
