"use client"

import { createContext, useContext, useMemo, useState } from "react"

interface GlossaryContextValue {
  activeTermId: string | null
  openTerm: (id: string) => void
  closeTerm: () => void
}

const GlossaryContext = createContext<GlossaryContextValue | null>(null)

export function GlossaryProvider({ children }: { children: React.ReactNode }) {
  const [activeTermId, setActiveTermId] = useState<string | null>(null)

  const value = useMemo(
    () => ({
      activeTermId,
      openTerm: (id: string) => setActiveTermId(id),
      closeTerm: () => setActiveTermId(null),
    }),
    [activeTermId]
  )

  return <GlossaryContext.Provider value={value}>{children}</GlossaryContext.Provider>
}

export function useGlossary() {
  const context = useContext(GlossaryContext)
  if (!context) {
    throw new Error("useGlossary must be used within a GlossaryProvider")
  }
  return context
}
