"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface SubmitFormProps {
  projectId: string
  tier: string
}

export function SubmitForm({ projectId, tier }: SubmitFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [commitUrl, setCommitUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch(`/api/tiers/${tier.toLowerCase()}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          type: tier === "T1" ? "DESIGN" : tier === "T2" ? "GDS" : "PCB",
          title,
          description,
          commitUrl,
          files: [],
        }),
      })
      router.refresh()
      setTitle("")
      setDescription("")
      setCommitUrl("")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:border-white/30"
          placeholder="My submission"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 min-h-[80px]"
          placeholder="What did you build?"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Commit URL (optional)</label>
        <input
          value={commitUrl}
          onChange={(e) => setCommitUrl(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:border-white/30"
          placeholder="https://github.com/.../commit/..."
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit for review"}
      </button>
    </form>
  )
}
