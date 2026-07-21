import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/get-auth-user"

export async function GET() {
  try {
    const user = await getAuthUser()
    return NextResponse.json({
      onboardComplete: user.onboardComplete,
      needsBirthday: !user.birthday,
      needsCountry: !user.country,
      needsDiscord: !user.discordHandle,
    })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
