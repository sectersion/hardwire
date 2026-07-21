import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db/prisma"

export async function POST() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("sessionId")?.value

  if (sessionId) {
    await prisma.userSession.deleteMany({ where: { id: sessionId } })
    cookieStore.delete("sessionId")
  }

  return NextResponse.json({ success: true })
}
