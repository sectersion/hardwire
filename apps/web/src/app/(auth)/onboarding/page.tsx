"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function OnboardingPage() {
  const router = useRouter()
  const [birthday, setBirthday] = useState("")
  const [country, setCountry] = useState("")
  const [discordHandle, setDiscordHandle] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch("/api/auth/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthday: birthday || undefined,
          country,
          discordHandle,
        }),
      })
      router.push("/dashboard")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">Welcome to Hardwire</h1>
        <p className="text-muted mb-8">Tell us a bit about yourself</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Birthday</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:border-white/30"
              placeholder="Where are you based?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Discord handle</label>
            <input
              value={discordHandle}
              onChange={(e) => setDiscordHandle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:border-white/30"
              placeholder="username#0000"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-white text-black py-3 rounded-xl font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Get started"}
          </button>
        </form>
      </div>
    </div>
  )
}
