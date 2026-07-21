import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/get-auth-user"
import { prisma } from "@/lib/db/prisma"
import { notifyNewSubmission } from "@/lib/slack/notify"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tier: string }> }
) {
  try {
    const user = await getAuthUser()
    const { tier } = await params
    const body = await request.json()

    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        projectId: body.projectId,
        tier: tier as any,
        type: body.type,
        title: body.title,
        description: body.description,
        files: body.files,
        commitUrl: body.commitUrl,
        status: "PENDING_REVIEW",
      },
    })

    await notifyNewSubmission({
      title: submission.title,
      tier: submission.tier,
      user: { firstName: user.firstName, lastName: user.lastName },
    })

    return NextResponse.json(submission, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
