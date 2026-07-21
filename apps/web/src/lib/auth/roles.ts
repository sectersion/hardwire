import { Role } from "shared"

export function hasRole(roles: Role[], ...wanted: Role[]): boolean {
  return roles.includes(Role.SUPERADMIN) || wanted.some((r) => roles.includes(r))
}

export function isElevated(roles: Role[]): boolean {
  return roles.some((r) => r !== Role.USER)
}
