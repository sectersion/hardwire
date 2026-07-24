import { Role } from "shared"
import { getAuthUser, ForbiddenError } from "./get-auth-user"
import { hasRole } from "./roles"

export async function requireReviewer() {
  const user = await getAuthUser()
  if (!hasRole(user.roles as Role[], Role.REVIEWER, Role.ADMIN, Role.SUPERADMIN)) {
    throw new ForbiddenError()
  }
  return user
}