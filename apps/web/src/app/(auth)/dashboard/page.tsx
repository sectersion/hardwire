export const dynamic = "force-dynamic"

import { getAuthUser } from "@/lib/auth/get-auth-user"
import { prisma } from "@/lib/db/prisma"
import Link from "next/link"

const tierLabels: Record<string, { label: string; gradient: string }> = {
  T1: { label: "T1: Digital Logic", gradient: "from-cyan-500 to-blue-600" },
  T2: { label: "T2: ASIC Tapeout", gradient: "from-purple-500 to-pink-600" },
  T3: { label: "T3: Custom Carrier Board", gradient: "from-amber-500 to-orange-600" },
}

export default async function DashboardPage() {
  const user = await getAuthUser()
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: { tiers: true, submissions: { orderBy: { createdAt: "desc" }, take: 5 } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user.firstName}</h1>
          <p className="text-muted mt-1">Track your silicon design journey</p>
        </div>
        <Link
          href="/dashboard/new"
          className="bg-white text-black px-5 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
        >
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-white/10 p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
          <p className="text-muted mb-6">Start your hardware engineering journey</p>
          <Link
            href="/dashboard/new"
            className="inline-block bg-white text-black px-6 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/project/${project.id}`}
              className="block rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{project.name}</h2>
                  {project.description && (
                    <p className="text-muted text-sm mt-1">{project.description}</p>
                  )}
                </div>
                <span className="text-xs text-muted">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-3">
                {project.tiers.map((tier) => {
                  const cfg = tierLabels[tier.tier]
                  return (
                    <div
                      key={tier.id}
                      className={`text-xs px-3 py-1 rounded-full border ${
                        tier.status === "COMPLETED"
                          ? "bg-green-500/10 border-green-500/30 text-green-400"
                          : tier.status === "ACTIVE"
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                            : "bg-white/5 border-white/10 text-muted"
                      }`}
                    >
                      {tier.tier}: {tier.status.toLowerCase()}
                    </div>
                  )
                })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
