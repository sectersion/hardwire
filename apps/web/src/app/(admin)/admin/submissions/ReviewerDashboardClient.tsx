"use client"

import React, { useState } from "react"
import { reviewSubmission } from "@/lib/actions/submissions" // adjust path to match where you save submissions-actions.ts

const ACCENT = "#FF1500"

const STATUS_LABEL = {
  PENDING_REVIEW: "pending review",
  CHANGES_REQUESTED: "changes requested",
  APPROVED: "approved",
}

// Checklist config per tier — move this to a shared constants file once you're happy with it
const TIER_CHECKLIST = {
  T1: [
    "RTL source files (Verilog/VHDL)",
    "Testbench included",
    "Simulation waveform / output attached",
    "README explains design decisions",
  ],
  T2: [
    "T1 requirements met",
    "Synthesis report attached",
    "DRC pass confirmed",
    "GDSII or equivalent included",
  ],
  T3: [
    "T2 requirements met",
    "KiCad source files (.kicad_pro/.kicad_sch/.kicad_pcb)",
    "BOM in CSV with total cost",
    "Gerbers included",
  ],
}

function StatusBadge({ status }) {
  const isAccent = status === "CHANGES_REQUESTED"
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold uppercase tracking-widest border-2"
      style={{
        borderColor: isAccent ? ACCENT : "var(--fg)",
        color: isAccent ? ACCENT : "var(--fg)",
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

export function ReviewerDashboardClient({ initialSubmissions, reviewerId }) {
  const [theme] = useState("dark")
  const isDark = theme === "dark"
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [filter, setFilter] = useState("ALL")
  const [selectedId, setSelectedId] = useState(initialSubmissions[0]?.id)
  const [draftNotes, setDraftNotes] = useState("")
  const [checkedItems, setCheckedItems] = useState({})
  const [pending, setPending] = useState(false)

  const filtered = submissions.filter((s) =>
    filter === "ALL" ? true : s.status === filter
  )
  const selected = submissions.find((s) => s.id === selectedId) || filtered[0]
  const checklist = selected ? TIER_CHECKLIST[selected.tier] || [] : []

  function toggleCheck(label) {
    setCheckedItems((prev) => ({
      ...prev,
      [selected.id]: {
        ...(prev[selected.id] || {}),
        [label]: !prev[selected.id]?.[label],
      },
    }))
  }

  async function handleDecision(decision) {
    if (!selected) return
    setPending(true)
    try {
      await reviewSubmission({
        submissionId: selected.id,
        decision,
        notes: draftNotes,
        reviewerId,
      })
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === selected.id
            ? { ...s, status: decision, reviewerNotes: draftNotes || s.reviewerNotes }
            : s
        )
      )
      setDraftNotes("")
    } finally {
      setPending(false)
    }
  }

  const counts = {
    ALL: submissions.length,
    PENDING_REVIEW: submissions.filter((s) => s.status === "PENDING_REVIEW").length,
    APPROVED: submissions.filter((s) => s.status === "APPROVED").length,
    CHANGES_REQUESTED: submissions.filter((s) => s.status === "CHANGES_REQUESTED").length,
  }

  return (
    <div
      style={{
        "--bg": isDark ? "#000000" : "#ffffff",
        "--fg": isDark ? "#ffffff" : "#000000",
        "--muted": isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
      }}
      className="min-h-screen font-body"
    >
      <header
        className="border-b-2 px-6 py-5 flex items-center justify-between"
        style={{ borderColor: "var(--fg)" }}
      >
        <h1 className="font-display text-xl font-extrabold lowercase">
          hardwire<span style={{ color: ACCENT }}>.</span> review
        </h1>
        <span className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          reviewer dashboard
        </span>
      </header>

      <div className="grid md:grid-cols-[380px_1fr] min-h-[calc(100vh-73px)]">
        {/* Submission list */}
        <div className="border-r-2" style={{ borderColor: "var(--fg)" }}>
          <div className="flex border-b-2" style={{ borderColor: "var(--fg)" }}>
            {["ALL", "PENDING_REVIEW", "APPROVED", "CHANGES_REQUESTED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-wider border-r-2 last:border-r-0 transition-colors"
                style={{
                  borderColor: "var(--fg)",
                  backgroundColor: filter === f ? "var(--fg)" : "transparent",
                  color: filter === f ? "var(--bg)" : "var(--fg)",
                }}
              >
                {f === "ALL" ? "all" : STATUS_LABEL[f]} ({counts[f]})
              </button>
            ))}
          </div>

          <div className="overflow-y-auto">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedId(s.id)
                  setDraftNotes("")
                }}
                className="w-full text-left p-4 border-b-2 transition-colors"
                style={{
                  borderColor: "var(--fg)",
                  backgroundColor: selected?.id === s.id ? "var(--fg)" : "transparent",
                  color: selected?.id === s.id ? "var(--bg)" : "var(--fg)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-bold border-2 px-1.5 py-0.5"
                    style={{ borderColor: "currentColor" }}
                  >
                    {s.tier} · {s.type}
                  </span>
                  <span className="text-xs opacity-60">{s.submittedAt}</span>
                </div>
                <p className="font-bold text-sm mb-1">{s.title}</p>
                <p className="text-xs opacity-60 mb-2">
                  {s.projectName} — {s.user}
                </p>
                <StatusBadge status={s.status} />
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="p-8 max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-xs font-bold border-2 px-2 py-1"
                style={{ borderColor: "var(--fg)" }}
              >
                {selected.tier} · {selected.type}
              </span>
              <StatusBadge status={selected.status} />
            </div>
            <h2 className="font-display text-2xl font-bold mb-1">{selected.title}</h2>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              {selected.projectName} — submitted by {selected.user} on {selected.submittedAt}
              {selected.commitUrl && (
                <>
                  {" · "}
                  <a href={selected.commitUrl} className="underline">
                    view commit
                  </a>
                </>
              )}
            </p>

            {selected.description && (
              <p className="text-sm mb-8 leading-relaxed">{selected.description}</p>
            )}

            <h3 className="font-display text-sm font-bold uppercase tracking-widest mb-3">
              {selected.tier} requirements checklist
            </h3>
            <ul className="mb-8 space-y-2">
              {checklist.map((label) => {
                const done = !!checkedItems[selected.id]?.[label]
                return (
                  <li key={label} className="flex items-center gap-2 text-sm">
                    <button
                      onClick={() => toggleCheck(label)}
                      className="w-4 h-4 border-2 flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{
                        borderColor: done ? "var(--fg)" : ACCENT,
                        color: done ? "var(--fg)" : ACCENT,
                      }}
                    >
                      {done ? "✓" : "×"}
                    </button>
                    <span style={{ color: done ? "var(--fg)" : ACCENT }}>{label}</span>
                  </li>
                )
              })}
            </ul>

            {selected.reviewerNotes && (
              <div className="mb-8 p-4 border-2" style={{ borderColor: "var(--fg)" }}>
                <h4
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "var(--muted)" }}
                >
                  reviewer notes
                </h4>
                <p className="text-sm">{selected.reviewerNotes}</p>
              </div>
            )}

            {selected.status === "PENDING_REVIEW" && (
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-widest mb-3">
                  add notes
                </h3>
                <textarea
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  placeholder="explain what's missing, or why this is approved..."
                  className="w-full p-3 mb-4 text-sm border-2 bg-transparent resize-none"
                  style={{ borderColor: "var(--fg)", color: "var(--fg)" }}
                  rows={4}
                />
                <div className="flex gap-3">
                  <button
                    disabled={pending}
                    onClick={() => handleDecision("APPROVED")}
                    className="px-6 py-3 font-bold border-2 transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "var(--fg)", color: "var(--bg)", borderColor: "var(--fg)" }}
                  >
                    {pending ? "saving..." : "approve"}
                  </button>
                  <button
                    disabled={pending}
                    onClick={() => handleDecision("CHANGES_REQUESTED")}
                    className="px-6 py-3 font-bold border-2 transition-colors disabled:opacity-50"
                    style={{ borderColor: ACCENT, color: ACCENT }}
                  >
                    {pending ? "saving..." : "request changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}