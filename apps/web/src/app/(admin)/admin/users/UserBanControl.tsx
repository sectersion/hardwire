"use client"

import { useState, useTransition } from "react"
import { banUser, restoreUser } from "@/lib/actions/user-roles"

const ACCENT = "#FF1500"

export function UserBanControl({
  userId,
  initialBanned,
}: {
  userId: string
  initialBanned: boolean
}) {
  const [banned, setBanned] = useState(initialBanned)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function toggle() {
    const previous = banned
    const next = !banned
    setBanned(next)
    setError(null)

    startTransition(async () => {
      try {
        if (next) {
          await banUser(userId)
        } else {
          await restoreUser(userId)
        }
      } catch (err) {
        setBanned(previous)
        setError(err instanceof Error ? err.message : "Failed to update")
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={toggle}
        className="text-xs font-bold uppercase tracking-widest px-2 py-1 border-2 transition-colors disabled:opacity-50"
        style={{
          borderColor: banned ? ACCENT : "var(--muted)",
          color: banned ? ACCENT : "var(--muted)",
          backgroundColor: banned ? "transparent" : "transparent",
        }}
      >
        {pending ? "..." : banned ? "restore" : "ban"}
      </button>
      {error && (
        <span className="text-xs" style={{ color: ACCENT }}>
          {error}
        </span>
      )}
    </div>
  )
}