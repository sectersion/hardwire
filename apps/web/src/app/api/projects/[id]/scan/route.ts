import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/get-auth-user"
import { prisma } from "@/lib/db/prisma"
import { scanRepoForTier } from "@/lib/github/scan-repo"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let user
  try {
    user = await getAuthUser()
  } catch {
    return NextResponse.json({ error: "You need to be signed in to do this." }, { status: 401 })
  }

  const { id } = await params
  const tier = request.nextUrl.searchParams.get("tier")?.toUpperCase()

  if (!tier || !["T1", "T2", "T3"].includes(tier)) {
    return NextResponse.json({ error: "Invalid or missing tier." }, { status: 400 })
  }

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project || project.userId !== user.id) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 })
  }
  if (!project.repoUrl) {
    return NextResponse.json({ error: "This project doesn't have a repo URL set yet." }, { status: 400 })
  }

  try {
    const files = await scanRepoForTier(project.repoUrl, tier)
    return NextResponse.json({ files })
  } catch (err) {
    console.error("Repo scan failed:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't scan the repo." },
      { status: 500 }
    )
  }
}