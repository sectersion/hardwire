"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewProjectPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [repoUrl, setRepoUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, repoUrl }),
      })
      const project = await res.json()
      router.push(`/dashboard/project/${project.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">New Project</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Project name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:border-white/30"
            placeholder="My chip design"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:border-white/30 min-h-[100px]"
            placeholder="What are you building?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Repository URL (optional)</label>
          <input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:border-white/30"
            placeholder="https://github.com/you/hardwire-project"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create project"}
        </button>
      </form>
    </div>
  )
}
