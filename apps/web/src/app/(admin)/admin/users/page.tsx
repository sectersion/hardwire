export const dynamic = "force-dynamic"

import { prisma } from "@/lib/db/prisma"
import { requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminUsersPage() {
  await requireAdmin()

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      roles: true,
      onboardComplete: true,
      banned: true,
      createdAt: true,
      _count: { select: { projects: true, submissions: true } },
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users ({users.length})</h1>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="rounded-xl border border-white/10 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {user.firstName} {user.lastName}
                  {user.banned && <span className="text-red-400 ml-2 text-xs">banned</span>}
                </p>
                <p className="text-xs text-muted">{user.email}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted">
                <span>{user._count.projects} projects</span>
                <span>{user._count.submissions} submissions</span>
                <span className={`px-2 py-0.5 rounded-full ${
                  user.roles.includes("ADMIN") ? "bg-purple-500/10 text-purple-400" : "bg-white/5"
                }`}>{user.roles.join(", ").toLowerCase()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
