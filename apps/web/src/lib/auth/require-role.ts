import { getAuthUser, ForbiddenError } from "@/lib/auth/get-auth-user"

export type Role = "REVIEWER" | "ADMIN" | "SUPERADMIN"

const ROLE_RANK: Record<Role, number> = {
  REVIEWER: 0,
  ADMIN: 1,
  SUPERADMIN: 2,
}

function highestRole(roles: string[]): Role {
  return (roles as Role[]).reduce(
    (max, r) => (ROLE_RANK[r] > ROLE_RANK[max] ? r : max),
    "REVIEWER" as Role
  )
}

export async function requireRole(minRole: Role) {
  const user = await getAuthUser()
  const roles = (user.roles as string[]) ?? []

  if (roles.length === 0 || ROLE_RANK[highestRole(roles)] < ROLE_RANK[minRole]) {
    throw new ForbiddenError()
  }

  return user
}