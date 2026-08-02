import { requireRole } from "@/lib/auth/require-role"

export async function requireSuperadmin() {
  return requireRole("SUPERADMIN")
}