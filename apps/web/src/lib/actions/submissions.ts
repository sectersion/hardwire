"use server"

import { prisma } from "@/lib/db/prisma"
import { revalidatePath } from "next/cache"
import { requireReviewer } from "@/lib/auth/require-reviewer"
import { requireSuperadmin } from "@/lib/auth/require-superadmin"

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

// Perma-reject. Gated the same way as approve/request-changes — any
// reviewer can do this, not admin-only (only the undo is admin-gated).
// If that assumption is wrong and reject itself should be admin-only,
// swap requireReviewer() for requireSuperadmin() here.
export async function rejectSubmission({
  submissionId,
  reason,
  reviewerId,
}: {
  submissionId: string
  reason: string
  reviewerId: string
}) {
  await requireReviewer()

  if (!reason.trim()) {
    throw new Error("A reason is required to reject a submission.")
  }

  const submission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: "REJECTED",
      reviewerNotes: reason,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    },
  })

  await prisma.project.update({
    where: { id: submission.projectId },
    data: {
      hidden: true,
      hiddenAt: new Date(),
      hiddenBy: reviewerId,
    },
  })

  await prisma.auditLog.create({
    data: {
      action: "SUBMISSION_REJECTED",
      actorId: reviewerId,
      targetType: "Submission",
      targetId: submission.id,
      reason,
    },
  })

  revalidatePath("/admin/submissions")
  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/project/${submission.projectId}`)
}

// Undo a perma-reject. Admin-only, unlike the reject itself.
export async function undoReject({
  submissionId,
  adminId,
}: {
  submissionId: string
  adminId: string
}) {
  await requireSuperadmin()

  const submission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: "PENDING_REVIEW",
      reviewedBy: null,
      reviewedAt: null,
    },
  })

  await prisma.project.update({
    where: { id: submission.projectId },
    data: {
      hidden: false,
      hiddenAt: null,
      hiddenBy: null,
    },
  })

  await prisma.auditLog.create({
    data: {
      action: "SUBMISSION_REJECT_UNDONE",
      actorId: adminId,
      targetType: "Submission",
      targetId: submission.id,
    },
  })

  revalidatePath("/admin/submissions")
  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/project/${submission.projectId}`)
}