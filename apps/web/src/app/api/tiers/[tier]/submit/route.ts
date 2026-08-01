import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/get-auth-user"
import { prisma } from "@/lib/db/prisma"
import { notifyNewSubmission } from "@/lib/slack/notify"
import { scanRepoForTier } from "@/lib/github/scan-repo"
import { Prisma } from "@prisma/client"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tier: string }> }
) {
  let user
  try {
    user = await getAuthUser()
  } catch {
    return NextResponse.json({ error: "You need to be signed in to do this." }, { status: 401 })
  }

  const { tier } = await params
  const tierUpper = tier.toUpperCase()
  if (!["T1", "T2", "T3"].includes(tierUpper)) {
    return NextResponse.json({ error: `Invalid tier: ${tier}` }, { status: 400 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (!body.projectId) {
    return NextResponse.json({ error: "projectId is required." }, { status: 400 })
  }

  const project = await prisma.project.findUnique({
    where: { id: body.projectId },
    include: { tiers: { where: { tier: tierUpper as any } } },
  })

  if (!project || project.userId !== user.id) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 })
  }

  if (!project.repoUrl) {
    return NextResponse.json({ error: "This project has no repo URL set." }, { status: 400 })
  }

  const progress = project.tiers[0]
  if (progress?.status === "COMPLETED") {
    return NextResponse.json({ error: "This tier is already completed." }, { status: 400 })
  }

  const existingPending = await prisma.submission.findFirst({
    where: { projectId: project.id, tier: tierUpper as any, status: "PENDING_REVIEW" },
  })
  if (existingPending) {
    return NextResponse.json(
      { error: "You already have a submission pending review for this tier." },
      { status: 400 }
    )
  }

  // Re-scan server-side rather than trusting whatever the client sends —
  // the client's "files found" state could be stale or tampered with.
  let files
  try {
    files = await scanRepoForTier(project.repoUrl, tierUpper)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't scan the repo." },
      { status: 500 }
    )
  }

  const submissionCount = await prisma.submission.count({
    where: { projectId: project.id, tier: tierUpper as any },
  })
  const title = `${project.name} — ${tierUpper} submission #${submissionCount + 1}`

  let submission
  try {
    submission = await prisma.submission.create({
      data: {
        userId: user.id,
        projectId: body.projectId,
        tier: tierUpper as "T1" | "T2" | "T3",
        type: body.type,
        title,
        description: body.notes || null,
        files: files as unknown as Prisma.InputJsonValue,
        status: "PENDING_REVIEW",
      },
    })
  } catch (err) {
    console.error("Failed to create submission:", err)
    return NextResponse.json(
      { error: "Failed to save your submission. Try again." },
      { status: 500 }
    )
  }

  try {
    await notifyNewSubmission({
      title: submission.title,
      tier: submission.tier,
      user: { firstName: user.firstName, lastName: user.lastName },
    })
  } catch (err) {
    console.error("Slack notification failed (submission still saved):", err)
  }

  return NextResponse.json(submission, { status: 201 })
}
