import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/get-auth-user"

export async function GET() {
  try {
    const user = await getAuthUser()
    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      roles: user.roles,
      onboardComplete: user.onboardComplete,
    })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
