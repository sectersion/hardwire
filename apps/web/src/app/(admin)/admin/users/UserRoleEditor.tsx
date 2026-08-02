"use client"

import { useState, useTransition } from "react"
import { updateUserRoles } from "@/lib/actions/user-roles"

const ACCENT = "#FF1500"
const ROLE_OPTIONS = ["REVIEWER", "ADMIN", "SUPERADMIN"] as const

export function UserRoleEditor({
  userId,
  initialRoles,
}: {
  userId: string
  initialRoles: string[]
}) {
  const [roles, setRoles] = useState<string[]>(
    initialRoles.filter((r) => (ROLE_OPTIONS as readonly string[]).includes(r))
  )
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function toggle(role: string) {
    const previous = roles
    const next = roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role]
    setRoles(next)
    setError(null)

    startTransition(async () => {
      try {
        await updateUserRoles(userId, next)
      } catch (err) {
        setRoles(previous)
        setError(err instanceof Error ? err.message : "Failed to update")
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {ROLE_OPTIONS.map((role) => (
          <button
            key={role}
            type="button"
            disabled={pending}
            onClick={() => toggle(role)}
            className="text-xs font-bold uppercase tracking-widest px-2 py-1 border-2 transition-colors disabled:opacity-50"
            style={{
              borderColor: roles.includes(role) ? ACCENT : "var(--muted)",
              color: roles.includes(role) ? ACCENT : "var(--muted)",
            }}
          >
            {role.toLowerCase()}
          </button>
        ))}
      </div>
      {error && (
        <span className="text-xs" style={{ color: ACCENT }}>
          {error}
        </span>
      )}
    </div>
  )
}