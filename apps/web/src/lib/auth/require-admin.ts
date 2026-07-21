import { Role } from "shared"
import { getAuthUser, ForbiddenError } from "./get-auth-user"
import { hasRole } from "./roles"

export async function requireAdmin() {
  const user = await getAuthUser()
  if (!hasRole(user.roles as Role[], Role.ADMIN, Role.SUPERADMIN)) {
    throw new ForbiddenError()
  }
  return user
}
