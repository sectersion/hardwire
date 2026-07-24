const HCA_AUTH_URL = "https://auth.hackclub.com/oauth/authorize"
const HCA_TOKEN_URL = "https://auth.hackclub.com/oauth/token"
const HCA_USERINFO_URL = "https://auth.hackclub.com/oauth/userinfo"

export interface HcaUserInfo {
  sub: string
  email: string
  name?: string
  given_name?: string
  family_name?: string
  preferred_username?: string
  avatar?: string
  birthdate?: string
  slack_id?: string
  "https://hackclub.com/verification_status"?: string
}

export function getClientConfig() {
  const clientId = process.env.HACKCLUB_CLIENT_ID
  const clientSecret = process.env.HACKCLUB_CLIENT_SECRET
  const redirectUri = process.env.HACKCLUB_REDIRECT_URI
  const stateSecret = process.env.STATE_SECRET

  if (!clientId || !clientSecret || !redirectUri || !stateSecret) {
    throw new Error("Missing HCA configuration")
  }

  return { clientId, clientSecret, redirectUri, stateSecret }
}

export function getAuthorizeUrl(state: string, redirect?: string) {
  const { clientId, redirectUri } = getClientConfig()
  const url = new URL(HCA_AUTH_URL)
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", "openid profile email name slack_id verification_status")
  url.searchParams.set("state", state)
  if (redirect) {
    url.searchParams.set("redirect", redirect)
  }
  return url.toString()
}

export async function exchangeCode(code: string): Promise<{ access_token: string }> {
  const { clientId, clientSecret, redirectUri } = getClientConfig()

  const res = await fetch(HCA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token exchange failed: ${res.status} ${text}`)
  }

  return res.json()
}

export async function getUserInfo(accessToken: string): Promise<HcaUserInfo> {
  const res = await fetch(HCA_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Userinfo request failed: ${res.status} ${text}`)
  }

  return res.json()
}