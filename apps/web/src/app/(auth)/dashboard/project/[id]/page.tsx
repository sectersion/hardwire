export const dynamic = "force-dynamic"

import { getAuthUser } from "@/lib/auth/get-auth-user"
import { prisma } from "@/lib/db/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"

const tierLabels: Record<string, { label: string; gradient: string }> = {
  T1: { label: "T1: Digital Logic", gradient: "from-cyan-500 to-blue-600" },
  T2: { label: "T2: ASIC Tapeout", gradient: "from-purple-500 to-pink-600" },
  T3: { label: "T3: Custom Carrier Board", gradient: "from-amber-500 to-orange-600" },
}

export default async function ProjectPage(props: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  const { id } = await props.params

  const project = await prisma.project.findUnique({
    where: { id },
    include: { tiers: true, submissions: { orderBy: { createdAt: "desc" } } },
  })

  if (!project || project.userId !== user.id) {
    notFound()
  }

  const activeTier = project.tiers.find((t) => t.status === "ACTIVE")
  const completedTiers = project.tiers.filter((t) => t.status === "COMPLETED")

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link href="/dashboard" className="text-sm text-muted hover:text-white transition-colors mb-6 inline-block">
        &larr; Back to dashboard
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-muted mt-2">{project.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-12">
        {project.tiers.map((tier) => {
          const cfg = tierLabels[tier.tier]
          return (
            <Link
              key={tier.id}
              href={`/dashboard/project/${project.id}/tier/${tier.tier.toLowerCase()}`}
              className={`block rounded-2xl border p-6 transition-colors ${
                tier.status === "ACTIVE"
                  ? "border-blue-500/30 bg-blue-500/5"
                  : tier.status === "COMPLETED"
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-white/10 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-sm font-bold`}>
                    {tier.tier}
                  </div>
                  <div>
                    <h3 className="font-semibold">{cfg.label}</h3>
                    <p className="text-sm text-muted">
                      {tier.status === "COMPLETED"
                        ? "Completed"
                        : tier.status === "ACTIVE"
                          ? "In progress"
                          : "Locked"}
                    </p>
                  </div>
                </div>
                {tier.status === "ACTIVE" && (
                  <span className="text-sm text-blue-400">Continue &rarr;</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {project.submissions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Submissions</h2>
          <div className="space-y-3">
            {project.submissions.map((sub) => (
              <div key={sub.id} className="rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{sub.title}</p>
                    <p className="text-sm text-muted">{sub.tier} &middot; {sub.type}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    sub.status === "APPROVED"
                      ? "bg-green-500/10 text-green-400"
                      : sub.status === "CHANGES_REQUESTED"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-blue-500/10 text-blue-400"
                  }`}>
                    {sub.status.toLowerCase().replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
