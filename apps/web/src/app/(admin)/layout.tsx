import { requireRole, type Role } from "@/lib/auth/require-role"
import { UnauthorizedError, ForbiddenError } from "@/lib/auth/get-auth-user"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AdminNav } from "./AdminNav"

const ACCENT = "#FF1500"

const ROLE_RANK: Record<Role, number> = {
  REVIEWER: 0,
  ADMIN: 1,
  SUPERADMIN: 2,
}

function highestRole(roles: string[]): Role {
  return (roles as Role[]).reduce(
    (max, r) => (ROLE_RANK[r] > ROLE_RANK[max] ? r : max),
    "REVIEWER" as Role
  )
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let user
  try {
    user = await requireRole("REVIEWER") // lowest tier — any admin-panel role can enter
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/api/auth/login")
    }
    if (err instanceof ForbiddenError) {
      redirect("/")
    }
    throw err
  }

  const roles = (user.roles as string[]) ?? []
  const topRole = highestRole(roles)

  return (
    <div
      style={{
        "--bg": "#000000",
        "--fg": "#ffffff",
        "--muted": "rgba(255,255,255,0.6)",
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
      } as React.CSSProperties}
      className="flex min-h-screen font-body"
    >
      <aside className="w-60 border-r-2 p-6 flex flex-col" style={{ borderColor: "var(--fg)" }}>
        <Link href="/admin" className="font-display text-xl font-extrabold lowercase mb-1 block">
          hardwire<span style={{ color: ACCENT }}>.</span> admin
        </Link>
        <span className="text-xs uppercase tracking-widest mb-8 block" style={{ color: "var(--muted)" }}>
          control panel · {topRole.toLowerCase()}
        </span>

        <AdminNav roles={roles} />

        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-widest border-2 px-3 py-2 text-center transition-colors mt-8"
          style={{ borderColor: "var(--fg)", color: "var(--fg)" }}
        >
          ← back to hardwire
        </Link>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}