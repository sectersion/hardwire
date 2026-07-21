import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import { prisma } from "@/lib/db/prisma"
import { notifySubmissionReviewed } from "@/lib/slack/notify"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const body = await request.json()

    const submission = await prisma.submission.update({
      where: { id },
      data: {
        status: body.status,
        reviewerNotes: body.notes,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
      },
    })

    await notifySubmissionReviewed({
      title: submission.title,
      status: submission.status,
    })

    if (body.status === "APPROVED") {
      const tierProgress = await prisma.tierProgress.findFirst({
        where: { userId: submission.userId, tier: submission.tier },
      })

      if (tierProgress) {
        await prisma.tierProgress.update({
          where: { id: tierProgress.id },
          data: { status: "COMPLETED", completedAt: new Date() },
        })
      }

      const tierOrder = ["T1", "T2", "T3"]
      const currentIdx = tierOrder.indexOf(submission.tier)
      if (currentIdx < tierOrder.length - 1) {
        const nextTier = tierOrder[currentIdx + 1]
        const nextProgress = await prisma.tierProgress.findFirst({
          where: { userId: submission.userId, tier: nextTier as any },
        })
        if (nextProgress && nextProgress.status === "LOCKED") {
          await prisma.tierProgress.update({
            where: { id: nextProgress.id },
            data: { status: "ACTIVE", startedAt: new Date() },
          })
        }
      }
    }

    return NextResponse.json(submission)
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}
