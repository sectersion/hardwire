"use server"

import { prisma } from "@/lib/db/prisma"
import { revalidatePath } from "next/cache"

type Decision = "APPROVED" | "CHANGES_REQUESTED"

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
  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: decision,
      reviewerNotes: notes,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    },
  })

  // If approved, you likely want to advance TierProgress here too, e.g.:
  // const submission = await prisma.submission.findUnique({ where: { id: submissionId } })
  // if (decision === "APPROVED" && submission) {
  //   await prisma.tierProgress.updateMany({
  //     where: { projectId: submission.projectId, tier: submission.tier },
  //     data: { status: "COMPLETED", completedAt: new Date() },
  //   })
  // }

  revalidatePath("/admin/submissions")
}