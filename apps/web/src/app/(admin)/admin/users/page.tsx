export const dynamic = "force-dynamic"

import { prisma } from "@/lib/db/prisma"
import { requireSuperadmin } from "@/lib/auth/require-superadmin"
import { UnauthorizedError, ForbiddenError } from "@/lib/auth/get-auth-user"
import { redirect } from "next/navigation"
import { UserSearch } from "./UserSearch"
import { UserRoleEditor } from "./UserRoleEditor"
import { getCachetUser, displayNameFor } from "@/lib/cachet"

const ACCENT = "#FF1500"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  try {
    await requireSuperadmin()
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/api/auth/login")
    }
    if (err instanceof ForbiddenError) {
      redirect("/")
    }
    throw err
  }

  const q = searchParams.q?.trim()

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { slackUserId: { contains: q, mode: "insensitive" } },
            { hcaId: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      roles: true,
      slackUserId: true,
      hcaId: true,
      banned: true,
      _count: { select: { projects: true, submissions: true } },
    },
  })

  const usersWithCachet = await Promise.all(
    users.map(async (user) => ({
      ...user,
      cachetUser: await getCachetUser(user.slackUserId),
    }))
  )

  return (
    <div>
      <h1 className="text-2xl font-display font-extrabold uppercase tracking-tight mb-6">
        Users <span style={{ color: "var(--muted)" }}>({users.length})</span>
      </h1>

      <UserSearch defaultValue={q ?? ""} />

      <div className="space-y-2 mt-6">
        {usersWithCachet.map((user) => (
          <div key={user.id} className="border-2 p-3" style={{ borderColor: "var(--fg)" }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-bold">
                  {displayNameFor(user, user.cachetUser)}
                  {user.banned && (
                    <span className="ml-2 text-xs uppercase tracking-widest" style={{ color: ACCENT }}>
                      banned
                    </span>
                  )}
                </p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {user.email}
                  {user.slackUserId ? ` · slack: ${user.slackUserId}` : ""}
                  {user.hcaId ? ` · hca: ${user.hcaId}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                <span>{user._count.projects} projects</span>
                <span>{user._count.submissions} submissions</span>
                <UserRoleEditor userId={user.id} initialRoles={user.roles} />
              </div>
            </div>
          </div>
        ))}
        {usersWithCachet.length === 0 && (
          <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            No users match &ldquo;{q}&rdquo;
          </p>
        )}
      </div>
    </div>
  )
}