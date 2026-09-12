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

export async function banUser(userId: string) {
  const actor = await requireSuperadmin()

  if (actor.id === userId) {
    throw new Error("You can't ban yourself")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { banned: true, bannedAt: new Date(), bannedBy: actor.id },
  })

  await prisma.auditLog.create({
    data: {
      action: "USER_BANNED",
      actorId: actor.id,
      targetType: "User",
      targetId: userId,
    },
  })

  revalidatePath("/admin/users")
}

// Restore is admin-gated the same as the ban itself — requireSuperadmin
// covers both, so there's no separate "only admin can undo" check
// needed here beyond what already guards this whole file.
export async function restoreUser(userId: string) {
  const actor = await requireSuperadmin()

  await prisma.user.update({
    where: { id: userId },
    data: { banned: false, bannedAt: null, bannedBy: null },
  })

  await prisma.auditLog.create({
    data: {
      action: "USER_RESTORED",
      actorId: actor.id,
      targetType: "User",
      targetId: userId,
    },
  })

  revalidatePath("/admin/users")
}