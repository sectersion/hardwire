import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/get-auth-user"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const user = await getAuthUser()
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: { tiers: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(projects)
  } catch (err) {
    console.error("Failed to list projects:", err)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

const GITHUB_URL_PATTERN = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/

export async function POST(request: NextRequest) {
  let user
  try {
    user = await getAuthUser()
  } catch (err) {
    console.error("Auth failed on project create:", err)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const name = typeof body.name === "string" ? body.name.trim() : ""
  const description = typeof body.description === "string" ? body.description.trim() : ""
  const repoUrl = typeof body.repoUrl === "string" ? body.repoUrl.trim() : ""

  if (!name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 })
  }
  if (!description) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 })
  }
  if (!repoUrl) {
    return NextResponse.json({ error: "Repository URL is required" }, { status: 400 })
  }
  if (!GITHUB_URL_PATTERN.test(repoUrl)) {
    return NextResponse.json(
      { error: "Repository URL must look like https://github.com/username/repo" },
      { status: 400 }
    )
  }

  try {
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name,
        description,
        repoUrl,
        currentTier: "T1",
        tiers: {
          createMany: {
            data: [
              { tier: "T1", status: "ACTIVE", userId: user.id },
              { tier: "T2", status: "LOCKED", userId: user.id },
              { tier: "T3", status: "LOCKED", userId: user.id },
            ],
          },
        },
      },
      include: { tiers: true },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (err) {
    console.error("Failed to create project:", err)
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to create project", detail: message },
      { status: 500 }
    )
  }
}