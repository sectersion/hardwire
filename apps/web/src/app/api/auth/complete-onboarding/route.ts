import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/get-auth-user"
import { prisma } from "@/lib/db/prisma"

export async function POST() {
  let user
  try {
    user = await getAuthUser()
  } catch {
    return NextResponse.json({ error: "You need to be signed in to do this." }, { status: 401 })
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardComplete: true },
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Failed to complete onboarding:", err)
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    )
  }
}