export const dynamic = "force-dynamic"

import { PageTransition } from "@/components/page-transition"
import { getAuthUser } from "@/lib/auth/get-auth-user"
import { prisma } from "@/lib/db/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { EditableProjectHeader } from "@/components/editable-project-header"
import { DeleteProjectButton } from "@/components/delete-project-button"

const ACCENT = "#FF1500"

const tierLabels: Record<string, string> = {
  T1: "Digital Logic",
  T2: "ASIC Tapeout",
  T3: "Custom Carrier Board",
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

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 py-12">
      <Link
        href="/dashboard"
        className="text-sm text-[var(--muted)] hover:text-[var(--fg)] transition-colors mb-6 inline-block"
      >
        &larr; Back to dashboard
      </Link>

      <EditableProjectHeader
        projectId={project.id}
        initialName={project.name}
        initialDescription={project.description}
        initialRepoUrl={project.repoUrl}
      />

      <div className="space-y-4 mb-12">
        {project.tiers.map((tier) => {
          const label = tierLabels[tier.tier] ?? tier.tier
          const isLocked = tier.status !== "ACTIVE" && tier.status !== "COMPLETED"
          const statusText =
            tier.status === "COMPLETED"
              ? "Completed"
              : tier.status === "ACTIVE"
                ? "In progress"
                : "Locked"

          const content = (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 border-2 flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ borderColor: "currentColor" }}
                >
                  {tier.tier}
                </div>
                <div>
                  <h3 className="font-display font-bold">
                    {tier.tier}: {label}
                  </h3>
                  <p className="text-sm text-[var(--muted)]">{statusText}</p>
                </div>
              </div>
              {tier.status === "ACTIVE" && (
                <span className="text-sm font-bold" style={{ color: ACCENT }}>
                  Continue &rarr;
                </span>
              )}
              {isLocked && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-40 shrink-0">
                  <rect x="3" y="11" width="18" height="11" rx="1" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
            </div>
          )

          const cardClass = "block border-2 p-6 transition-colors"
          const cardStyle = {
            borderColor: "var(--fg)",
            opacity: isLocked ? 0.4 : 1,
          }

          if (isLocked) {
            return (
              <div key={tier.id} className={cardClass} style={cardStyle}>
                {content}
              </div>
            )
          }

          return (
            <Link
              key={tier.id}
              href={`/dashboard/project/${project.id}/tier/${tier.tier.toLowerCase()}`}
              className={`${cardClass} hover:bg-[var(--fg)] hover:text-[var(--bg)]`}
              style={cardStyle}
            >
              {content}
            </Link>
          )
        })}
      </div>

      {project.submissions.length > 0 && (
        <div className="mb-12">
          <h2 className="font-display text-xl font-bold mb-4">Submissions</h2>
          <div className="space-y-3">
            {project.submissions.map((sub) => (
              <div key={sub.id} className="border-2 p-4" style={{ borderColor: "var(--fg)" }}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{sub.title}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {sub.tier} &middot; {sub.type}
                    </p>
                  </div>
                  <span
                    className="text-xs px-3 py-1 border-2 font-bold uppercase tracking-wide shrink-0"
                    style={{
                      borderColor:
                        sub.status === "CHANGES_REQUESTED" ? ACCENT : "var(--fg)",
                      color: sub.status === "CHANGES_REQUESTED" ? ACCENT : "var(--fg)",
                    }}
                  >
                    {sub.status.toLowerCase().replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t-2 pt-6" style={{ borderColor: "var(--muted)" }}>
        <DeleteProjectButton projectId={project.id} />
      </div>
      </div>
    </PageTransition>
  )
}