import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/get-auth-user"
import { prisma } from "@/lib/db/prisma"
import { Role } from "shared"

export async function GET() {
  try {
    const user = await getAuthUser()
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: { tiers: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(projects)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    const body = await request.json()

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name: body.name,
        description: body.description,
        repoUrl: body.repoUrl,
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
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
