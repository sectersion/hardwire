import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/get-auth-user"
import { prisma } from "@/lib/db/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    const body = await request.json()

    await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardComplete: true,
        birthday: body.birthday ? new Date(body.birthday) : undefined,
        country: body.country || undefined,
        discordHandle: body.discordHandle || undefined,
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
