import { NextRequest, NextResponse } from "next/server"
import { encode } from "jose/base64url"
import { createHmac } from "node:crypto"
import { getAuthorizeUrl } from "@/lib/hca/client"

// Only allow relative, same-site paths. Blocks:
// - absolute URLs (https://evil.com)
// - protocol-relative URLs (//evil.com)
// - anything not starting with a single "/"
function sanitizeRedirect(redirect: string | null): string {
  const fallback = "/dashboard"
  if (!redirect) return fallback
  if (!redirect.startsWith("/") || redirect.startsWith("//")) return fallback
  // Extra guard against sneaky schemes like "/\evil.com" or "/\\evil.com"
  if (redirect.includes("\\")) return fallback
  return redirect
}

function generateStateToken(redirect: string): string {
  const secret = process.env.STATE_SECRET!
  const data = { redirect, timestamp: Date.now() }
  const encoded = encode(Buffer.from(JSON.stringify(data)))
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url")
  return `${encoded}.${signature}`
}

export async function GET(request: NextRequest) {
  const redirect = sanitizeRedirect(request.nextUrl.searchParams.get("redirect"))
  const state = generateStateToken(redirect)
  const url = getAuthorizeUrl(state, redirect)

  return NextResponse.json({ url, state })
}