import { cookies } from "next/headers"
import { prisma } from "@/lib/db/prisma"

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized")
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden")
    this.name = "ForbiddenError"
  }
}

export async function getAuthUser() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("sessionId")?.value
  if (!sessionId) throw new UnauthorizedError()

  const session = await prisma.userSession.findUnique({
    where: { id: sessionId },
    include: { user: true },
  })
  if (!session || session.expiresAt < new Date()) {
    throw new UnauthorizedError()
  }

  if (session.user.banned) throw new ForbiddenError()

  return session.user
}
