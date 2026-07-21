import { NextRequest, NextResponse } from "next/server"
import { encode } from "jose/base64url"
import { createHmac } from "node:crypto"
import { getAuthorizeUrl } from "@/lib/hca/client"

function generateStateToken(redirect?: string): string {
  const secret = process.env.STATE_SECRET!
  const data = { redirect: redirect || "/dashboard", timestamp: Date.now() }
  const encoded = encode(Buffer.from(JSON.stringify(data)))
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url")
  return `${encoded}.${signature}`
}

export async function GET(request: NextRequest) {
  const redirect = request.nextUrl.searchParams.get("redirect") || "/dashboard"
  const state = generateStateToken(redirect)
  const url = getAuthorizeUrl(state, redirect)

  return NextResponse.json({ url, state })
}
