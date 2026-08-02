"use client"

import Link from "next/link"

type Role = "REVIEWER" | "ADMIN" | "SUPERADMIN"

const ROLE_RANK: Record<Role, number> = { REVIEWER: 0, ADMIN: 1, SUPERADMIN: 2 }

const navItems: { href: string; label: string; minRole: Role }[] = [
  { href: "/admin", label: "overview", minRole: "REVIEWER" },
  { href: "/admin/submissions", label: "submissions", minRole: "REVIEWER" },
  { href: "/admin/shipments", label: "shipments", minRole: "ADMIN" },
  { href: "/admin/users", label: "users", minRole: "SUPERADMIN" },
]

function highestRole(roles: Role[]): Role {
  return roles.reduce((max, r) => (ROLE_RANK[r] > ROLE_RANK[max] ? r : max), "REVIEWER" as Role)
}

export function AdminNav({ roles }: { roles: string[] }) {
  const top = highestRole(roles as Role[])
  const items = navItems.filter((item) => ROLE_RANK[top] >= ROLE_RANK[item.minRole])

  return (
    <nav className="space-y-1 flex-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block text-sm font-bold uppercase tracking-wider py-2 px-3 border-2 border-transparent transition-colors"
          style={{ color: "var(--fg)" }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--fg)" }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = "transparent" }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}