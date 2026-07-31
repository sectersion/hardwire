"use client"

import { PageTransition } from "@/components/page-transition"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

const ACCENT = "#FF1500"

export default function NewProjectPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [repoUrl, setRepoUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, repoUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create project")
      }
      router.push(`/dashboard/project/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")
      setSubmitting(false)
    }
  }

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-12">
      <Link
        href="/dashboard"
        className="text-sm text-[var(--muted)] hover:text-[var(--fg)] transition-colors mb-6 inline-block"
      >
        &larr; Back to dashboard
      </Link>

      <h1 className="font-display text-4xl font-extrabold lowercase leading-none mb-10">
        new project<span style={{ color: ACCENT }}>.</span>
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-[var(--muted)] mb-2">
            Project name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border-2 px-4 py-3 text-sm outline-none"
            style={{ borderColor: "var(--fg)", color: "var(--fg)" }}
            placeholder="My chip design"
            required
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-[var(--muted)] mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-transparent border-2 px-4 py-3 text-sm outline-none min-h-[100px] resize-none"
            style={{ borderColor: "var(--fg)", color: "var(--fg)" }}
            placeholder="What are you building?"
            required
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-[var(--muted)] mb-2">
            Repository URL
          </label>
          <input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full bg-transparent border-2 px-4 py-3 text-sm outline-none"
            style={{ borderColor: "var(--fg)", color: "var(--fg)" }}
            placeholder="https://github.com/you/hardwire-project"
            pattern="https://github\.com/[\w.\-]+/[\w.\-]+/?"
            title="Must be a GitHub repo URL, e.g. https://github.com/you/hardwire-project"
            required
          />
          <p className="text-xs text-[var(--muted)] mt-2">
            This must already exist — hardwire doesn't create the repo for
            you, it just links to it.
          </p>
        </div>

        {error && (
          <p className="text-sm font-medium" style={{ color: ACCENT }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="border-2 px-6 py-3 font-bold text-sm disabled:opacity-50"
          style={{ borderColor: "var(--fg)", backgroundColor: "var(--fg)", color: "var(--bg)" }}
        >
          {submitting ? "Creating..." : "Create project"}
        </button>
      </form>
      </div>
    </PageTransition>
  )
}