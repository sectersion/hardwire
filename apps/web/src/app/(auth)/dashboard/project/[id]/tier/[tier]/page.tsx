export const dynamic = "force-dynamic"

import { getAuthUser } from "@/lib/auth/get-auth-user"
import { prisma } from "@/lib/db/prisma"
import { notFound } from "next/navigation"
import { SubmitForm } from "./submit-form"
import Link from "next/link"

const tierInfo: Record<string, { label: string; description: string; reward: string }> = {
  t1: { label: "T1: Digital Logic", description: "Design and simulate a digital logic circuit", reward: "iCE40 FPGA Board" },
  t2: { label: "T2: ASIC Tapeout", description: "Complete synthesis and DRC pass", reward: "ASIC Shuttle Slot" },
  t3: { label: "T3: Custom Carrier Board", description: "Design a custom PCB", reward: "PCB Fab & Test Components" },
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href={`/dashboard/project/${id}`}
        className="text-sm text-muted hover:text-white transition-colors mb-6 inline-block"
      >
        &larr; Back to project
      </Link>

      <h1 className="text-3xl font-bold mb-2">{info.label}</h1>
      <p className="text-muted mb-2">{info.description}</p>
      <p className="text-sm text-muted mb-8">Reward: {info.reward}</p>

      {project.submissions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Previous submissions</h2>
          <div className="space-y-2">
            {project.submissions.map((sub) => (
              <div key={sub.id} className="rounded-xl border border-white/10 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{sub.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    sub.status === "APPROVED"
                      ? "bg-green-500/10 text-green-400"
                      : sub.status === "CHANGES_REQUESTED"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-blue-500/10 text-blue-400"
                  }`}>{sub.status.toLowerCase().replace(/_/g, " ")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold mb-4">Submit your work</h2>
        <SubmitForm projectId={id} tier={tierKey.toUpperCase()} />
      </div>
    </div>
  )
}
