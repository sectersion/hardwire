"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const ACCENT = "#FF1500"

interface SubmitFormProps {
  projectId: string
  tier: string
}

const LABELS: Record<string, Record<string, { label: string; hint?: string }>> = {
  T1: {
    rtl: { label: "RTL source files (Verilog/VHDL)" },
    testbench: { label: "Testbench", hint: `filename must contain "tb" or "test"` },
    simulation: { label: "Simulation waveform / output" },
    readme: { label: "README exists" },
  },
  T2: {
    synthesis_report: { label: "Synthesis report", hint: `filename must contain "synth"` },
    drc_report: { label: "DRC pass report", hint: `filename must contain "drc"` },
    gds: { label: "GDSII or equivalent" },
    readme: { label: "README exists" },
  },
  T3: {
    kicad_source: { label: "KiCad source files" },
    bom: { label: "BOM (CSV, with total cost)", hint: `filename must contain "bom"` },
    gerbers: { label: "Gerbers" },
    readme: { label: "README exists" },
  },
}

const TYPE_BY_TIER: Record<string, string> = { T1: "DESIGN", T2: "GDS", T3: "PCB" }

export function SubmitForm({ projectId, tier }: SubmitFormProps) {
  const router = useRouter()
  const labels = LABELS[tier] ?? {}

  const [scanning, setScanning] = useState(true)
  const [files, setFiles] = useState<Record<string, { path: string; url: string }[]>>({})
  const [scanError, setScanError] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    runScan()
  }, [])

  async function runScan() {
    setScanning(true)
    setScanError("")
    try {
      const res = await fetch(`/api/projects/${projectId}/scan?tier=${tier.toLowerCase()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Scan failed.")
      setFiles(data.files)
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Couldn't scan your repo.")
    } finally {
      setScanning(false)
    }
  }

  const missing = Object.entries(labels).filter(([key]) => !(files[key]?.length > 0))

  function openConfirm(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError("")
    setShowConfirm(true)
  }

  async function confirmSubmit() {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/tiers/${tier.toLowerCase()}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, type: TYPE_BY_TIER[tier], notes }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Submission failed. Try again.")
      }
      router.refresh()
      setNotes("")
      setShowConfirm(false)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed. Try again.")
      setShowConfirm(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={openConfirm} className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            scanned from your repo
          </h3>
          <button
            type="button"
            onClick={runScan}
            disabled={scanning}
            className="text-xs font-bold underline disabled:opacity-50"
          >
            {scanning ? "scanning..." : "rescan"}
          </button>
        </div>

        <p className="text-xs" style={{ color: "var(--muted)" }}>
          this is just a heads-up based on what's in your repo. it won't stop you from submitting.
        </p>

        {scanError && (
          <p className="text-sm border-2 p-3" style={{ borderColor: ACCENT, color: ACCENT }}>
            {scanError}
          </p>
        )}

        {!scanning &&
          !scanError &&
          Object.entries(labels).map(([key, { label, hint }]) => {
            const found = files[key] ?? []
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold">{label}</span>
                  <span
                    className="text-xs font-bold border-2 px-2 py-0.5"
                    style={{
                      borderColor: found.length > 0 ? "var(--fg)" : "var(--muted)",
                      color: found.length > 0 ? "var(--fg)" : "var(--muted)",
                    }}
                  >
                    {found.length > 0 ? `✓ ${found.length} found` : "not detected"}
                  </span>
                </div>
                {hint && (
                  <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                    ({hint})
                  </p>
                )}
                {found.length > 0 && (
                  <ul className="text-xs space-y-1 pl-4" style={{ color: "var(--muted)" }}>
                    {found.map((f) => (
                      <li key={f.path}>
                        <a href={f.url} target="_blank" rel="noreferrer" className="underline">
                          {f.path}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">
            notes to reviewer (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border-2 bg-transparent px-4 py-2.5 text-sm focus:outline-none min-h-[90px]"
            style={{ borderColor: "var(--fg)" }}
            placeholder="Anything the reviewer should know before checking this?"
          />
        </div>

        {submitError && (
          <p className="text-sm border-2 p-3" style={{ borderColor: ACCENT, color: ACCENT }}>
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={scanning}
          className="w-full py-3 font-bold border-2 transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--fg)", color: "var(--bg)", borderColor: "var(--fg)" }}
        >
          submit for review
        </button>
      </form>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => !submitting && setShowConfirm(false)}
        >
          <div
            className="w-full max-w-md border-2 p-6"
            style={{ backgroundColor: "var(--bg)", borderColor: "var(--fg)", color: "var(--fg)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg font-bold mb-4 lowercase">
              {missing.length > 0 ? "some things weren't detected" : "everything looks good"}
              <span style={{ color: ACCENT }}>.</span>
            </h2>

            {missing.length > 0 ? (
              <>
                <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
                  the scan didn't find these — double check the file exists and is named correctly, or submit anyway if you know it's there:
                </p>
                <ul className="mb-6 space-y-2">
                  {missing.map(([key, { label, hint }]) => (
                    <li key={key} className="text-sm">
                      <span style={{ color: ACCENT }}>×</span> {label}
                      {hint && (
                        <span style={{ color: "var(--muted)" }}> — {hint}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
                every requirement was detected in your repo. ready to submit for review?
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="flex-1 py-3 font-bold border-2 transition-colors disabled:opacity-50"
                style={{ borderColor: "var(--fg)" }}
              >
                cancel
              </button>
              <button
                type="button"
                onClick={confirmSubmit}
                disabled={submitting}
                className="flex-1 py-3 font-bold border-2 transition-colors disabled:opacity-50"
                style={{ backgroundColor: "var(--fg)", color: "var(--bg)", borderColor: "var(--fg)" }}
              >
                {submitting ? "submitting..." : "i'm sure, submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}