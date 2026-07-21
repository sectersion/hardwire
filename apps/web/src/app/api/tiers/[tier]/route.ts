import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/get-auth-user"
import { prisma } from "@/lib/db/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tier: string }> }
) {
  try {
    const user = await getAuthUser()
    const { tier } = await params

    const progress = await prisma.tierProgress.findFirst({
      where: { userId: user.id, tier: tier as any },
    })

    const submissions = await prisma.submission.findMany({
      where: { userId: user.id, tier: tier as any },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ progress, submissions })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
