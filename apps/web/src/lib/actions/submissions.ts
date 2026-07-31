"use server"

import { prisma } from "@/lib/db/prisma"
import { revalidatePath } from "next/cache"

type Decision = "APPROVED" | "CHANGES_REQUESTED"

const TIER_ORDER = ["T1", "T2", "T3"] as const
type TierKey = (typeof TIER_ORDER)[number]

export async function reviewSubmission({
  submissionId,
  decision,
  notes,
  reviewerId,
}: {
  submissionId: string
  decision: Decision
  notes: string
  reviewerId: string
}) {
  const submission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: decision,
      reviewerNotes: notes,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    },
  })

  if (decision === "APPROVED") {
    // Mark this tier as completed on the project.
    await prisma.tierProgress.upsert({
      where: {
        projectId_tier: { projectId: submission.projectId, tier: submission.tier },
      },
      update: { status: "COMPLETED", completedAt: new Date() },
      create: {
        projectId: submission.projectId,
        userId: submission.userId,
        tier: submission.tier,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    })

    // Unlock the next tier, if there is one.
    const currentIndex = TIER_ORDER.indexOf(submission.tier as TierKey)
    const nextTier = TIER_ORDER[currentIndex + 1]

    if (nextTier) {
      await prisma.tierProgress.upsert({
        where: {
          projectId_tier: { projectId: submission.projectId, tier: nextTier },
        },
        update: { status: "ACTIVE", startedAt: new Date() },
        create: {
          projectId: submission.projectId,
          userId: submission.userId,
          tier: nextTier,
          status: "ACTIVE",
          startedAt: new Date(),
        },
      })
    }
  }

  revalidatePath("/admin/submissions")
  revalidatePath(`/dashboard/project/${submission.projectId}`)
}