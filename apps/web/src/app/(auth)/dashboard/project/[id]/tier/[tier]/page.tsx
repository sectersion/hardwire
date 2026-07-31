export const dynamic = "force-dynamic"

import { getAuthUser } from "@/lib/auth/get-auth-user"
import { prisma } from "@/lib/db/prisma"
import { notFound } from "next/navigation"
import { SubmitForm } from "./submit-form"
import Link from "next/link"

const ACCENT = "#FF1500"

const tierInfo: Record<string, { label: string; description: string; reward: string }> = {
  t1: { label: "T1: Digital Logic", description: "Design and simulate a digital logic circuit", reward: "iCE40 FPGA Board" },
  t2: { label: "T2: ASIC Tapeout", description: "Complete synthesis and DRC pass", reward: "ASIC Shuttle Slot" },
  t3: { label: "T3: Custom Carrier Board", description: "Design a custom PCB", reward: "PCB Fab & Test Components" },
}

const statusLabel: Record<string, string> = {
  PENDING_REVIEW: "pending review",
  CHANGES_REQUESTED: "changes requested",
  APPROVED: "approved",
}

export default async function TierPage(props: {
  params: Promise<{ id: string; tier: string }>
}) {
  const user = await getAuthUser()
  const { id, tier } = await props.params
  const tierKey = tier.toLowerCase() as keyof typeof tierInfo

  if (!tierInfo[tierKey]) notFound()

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tiers: { where: { tier: tierKey.toUpperCase() as any } },
      submissions: { where: { tier: tierKey.toUpperCase() as any }, orderBy: { createdAt: "desc" } },
    },
  })

  if (!project || project.userId !== user.id) notFound()

  const progress = project.tiers[0]
  if (!progress || progress.status === "LOCKED") notFound()

  const info = tierInfo[tierKey]
  const latestSubmission = project.submissions[0]
  const isCompleted = progress.status === "COMPLETED"
  const isPending = latestSubmission?.status === "PENDING_REVIEW"

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link
        href={`/dashboard/project/${id}`}
        className="text-sm mb-6 inline-block"
        style={{ color: "var(--muted)" }}
      >
        &larr; back to project
      </Link>

      <h1 className="font-display text-3xl font-bold lowercase mb-2">
        {info.label.toLowerCase()}
        <span style={{ color: ACCENT }}>.</span>
      </h1>
      <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>
        {info.description}
      </p>
      <p className="text-sm mb-10" style={{ color: "var(--muted)" }}>
        reward: {info.reward}
      </p>

      {isCompleted && (
        <div className="border-2 p-5 mb-8" style={{ borderColor: "var(--fg)" }}>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2">
            tier completed
          </h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            You've already completed this tier — nothing left to submit here.
          </p>
        </div>
      )}

      {!isCompleted && isPending && (
        <div className="border-2 p-5 mb-8" style={{ borderColor: "var(--fg)" }}>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2">
            submission under review
          </h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Your latest submission is still being reviewed. You'll be able to resubmit if changes are requested.
          </p>
        </div>
      )}

      {/* Requested changes — surfaced prominently, not buried */}
      {latestSubmission?.status === "CHANGES_REQUESTED" && (
        <div className="border-2 p-5 mb-8" style={{ borderColor: ACCENT }}>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: ACCENT }}>
            changes requested
          </h2>
          <p className="text-sm">
            {latestSubmission.reviewerNotes || "No specific notes were left. Check the requirements above."}
          </p>
        </div>
      )}

      {project.submissions.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
            submission history
          </h2>
          <div className="space-y-2">
            {project.submissions.map((sub) => (
              <div key={sub.id} className="border-2 p-3 flex items-center justify-between" style={{ borderColor: "var(--fg)" }}>
                <span className="text-sm">{new Date(sub.createdAt).toLocaleDateString()}</span>
                <span
                  className="text-xs font-bold border-2 px-2 py-0.5"
                  style={{
                    borderColor: sub.status === "CHANGES_REQUESTED" ? ACCENT : "var(--fg)",
                    color: sub.status === "CHANGES_REQUESTED" ? ACCENT : "var(--fg)",
                  }}
                >
                  {statusLabel[sub.status] ?? sub.status.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isCompleted && !isPending && <SubmitForm projectId={id} tier={tierKey.toUpperCase()} />}
    </div>
  )
}