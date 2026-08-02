"use server"

import { prisma } from "@/lib/db/prisma"
import { requireSuperadmin } from "@/lib/auth/require-superadmin"
import { revalidatePath } from "next/cache"

const EDITABLE_ROLES = ["REVIEWER", "ADMIN", "SUPERADMIN"] as const
type EditableRole = (typeof EDITABLE_ROLES)[number]

export async function updateUserRoles(userId: string, roles: string[]) {
  const actor = await requireSuperadmin() // throws UnauthorizedError / ForbiddenError

  const validRoles = roles.filter((r): r is EditableRole =>
    EDITABLE_ROLES.includes(r as EditableRole)
  )

  if (actor.id === userId && !validRoles.includes("SUPERADMIN")) {
    throw new Error("You can't remove your own superadmin role")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { roles: validRoles },
  })

  revalidatePath("/admin/users")
}