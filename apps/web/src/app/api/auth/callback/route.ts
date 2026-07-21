import { NextRequest, NextResponse } from "next/server"
import { decode } from "jose/base64url"
import { createHmac } from "node:crypto"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db/prisma"
import { exchangeCode, getUserInfo } from "@/lib/hca/client"

function verifyStateToken(token: string): { redirect: string } | null {
  const secret = process.env.STATE_SECRET!
  const [encoded, signature] = token.split(".")

  if (!encoded || !signature) return null

  const expectedSignature = createHmac("sha256", secret).update(encoded).digest("base64url")
  if (signature !== expectedSignature) return null

  try {
    const decoded = JSON.parse(new TextDecoder().decode(decode(encoded)))
    if (Date.now() - decoded.timestamp > 10 * 60 * 1000) return null
    return { redirect: decoded.redirect }
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")

  if (!code || !state) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const stateData = verifyStateToken(state)
  if (!stateData) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  try {
    const tokens = await exchangeCode(code)
    const hcaUser = await getUserInfo(tokens.access_token)

    let user = await prisma.user.findFirst({
      where: { OR: [{ hcaId: hcaUser.sub }, { email: hcaUser.email }] },
    })

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          hcaId: user.hcaId || hcaUser.sub,
          firstName: hcaUser.given_name || user.firstName,
          lastName: hcaUser.family_name || user.lastName,
          avatarUrl: hcaUser.avatar || user.avatarUrl,
          birthday: hcaUser.birthdate ? new Date(hcaUser.birthdate) : user.birthday,
        },
      })
    } else {
      user = await prisma.user.create({
        data: {
          email: hcaUser.email,
          firstName: hcaUser.given_name || hcaUser.preferred_username || "Temporary",
          lastName: hcaUser.family_name || "User",
          hcaId: hcaUser.sub,
          avatarUrl: hcaUser.avatar,
          birthday: hcaUser.birthdate ? new Date(hcaUser.birthdate) : null,
          roles: ["USER"],
        },
      })
    }

    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      },
    })

    const cookieStore = await cookies()
    cookieStore.set("sessionId", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 21 * 24 * 60 * 60,
      path: "/",
    })

    const redirectTarget = user.onboardComplete ? stateData.redirect : "/onboarding"
    return NextResponse.redirect(new URL(redirectTarget, request.url))
  } catch (error) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url))
  }
}
