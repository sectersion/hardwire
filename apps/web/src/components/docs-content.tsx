"use client"

import { useEffect, useRef } from "react"
import { useGlossary } from "@/components/glossary-provider"

export function DocsContent({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { openTerm } = useGlossary()

  useEffect(() => {
    if (!containerRef.current) return

    const buttons = containerRef.current.querySelectorAll<HTMLButtonElement>(".glossary-term")
    const handleClick = (event: Event) => {
      const target = event.currentTarget as HTMLButtonElement | null
      const id = target?.dataset.glossaryId
      event.preventDefault()
      event.stopPropagation()
      if (id) openTerm(id)
    }

    buttons.forEach((button) => {
      button.addEventListener("click", handleClick)
    })

    return () => {
      buttons.forEach((button) => {
        button.removeEventListener("click", handleClick)
      })
    }
  }, [html, openTerm])

  return <div ref={containerRef} className="docs-content" dangerouslySetInnerHTML={{ __html: html }} />
}
