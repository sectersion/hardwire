import { prisma } from "@/lib/db/prisma"
import { ReviewerDashboardClient } from "./ReviewerDashboardClient"
import { requireReviewer } from "@/lib/auth/require-reviewer"
import { getAuthUser, UnauthorizedError, ForbiddenError } from "@/lib/auth/get-auth-user"
import { redirect } from "next/navigation"
import { Role } from "shared"
import { hasRole } from "@/lib/auth/roles"

export default async function AdminSubmissionsPage() {
  let reviewer
  try {
    reviewer = await requireReviewer()
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/api/auth/login")
    }
    if (err instanceof ForbiddenError) {
      redirect("/") // or a dedicated "not authorized" page if you build one
    }
    throw err
  }

  // Same cast rationale as dashboard/layout.tsx: user.roles is
  // Prisma's generated Role enum, structurally identical to shared's
  // Role enum but a distinct nominal TS type.
  const authUser = await getAuthUser()
  const isAdmin = hasRole(authUser.roles as unknown as Role[], Role.ADMIN)

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
      project: {
        select: { name: true },
      },
    },
  })

  const reviewerId = reviewer.id

  const formatted = submissions.map((s) => ({
    id: s.id,
    user: `${s.user.firstName} ${s.user.lastName}`,
    projectName: s.project.name,
    tier: s.tier,
    type: s.type,
    title: s.title,
    description: s.description ?? "",
    files: s.files,
    status: s.status,
    submittedAt: s.createdAt.toISOString().slice(0, 10),
    commitUrl: s.commitUrl,
    reviewerNotes: s.reviewerNotes ?? "",
  }))

  return (
    <ReviewerDashboardClient
      initialSubmissions={formatted}
      reviewerId={reviewerId}
      isAdmin={isAdmin}
    />
  )
}