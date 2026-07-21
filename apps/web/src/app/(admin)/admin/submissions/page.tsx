export const dynamic = "force-dynamic"

import { prisma } from "@/lib/db/prisma"
import { requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminSubmissionsPage() {
  await requireAdmin()

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  })

  const pending = submissions.filter((s) => s.status === "PENDING_REVIEW")

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Submissions</h1>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Pending review ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map((sub) => (
              <div key={sub.id} className="rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{sub.title}</p>
                    <p className="text-sm text-muted">
                      {sub.user.firstName} {sub.user.lastName} &middot; {sub.tier} &middot; {sub.type}
                    </p>
                  </div>
                  <form action={`/api/submissions/${sub.id}/review`} method="POST" className="flex gap-2">
                    <input type="hidden" name="status" value="APPROVED" />
                    <button
                      type="submit"
                      className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                    >
                      Approve
                    </button>
                    <input type="hidden" name="status" value="CHANGES_REQUESTED" />
                    <button
                      type="submit"
                      className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                    >
                      Request changes
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">All submissions</h2>
      <div className="space-y-2">
        {submissions.map((sub) => (
          <div key={sub.id} className="rounded-xl border border-white/10 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{sub.title}</p>
                <p className="text-xs text-muted">{sub.user.firstName} {sub.user.lastName}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                sub.status === "APPROVED" ? "bg-green-500/10 text-green-400"
                  : sub.status === "CHANGES_REQUESTED" ? "bg-amber-500/10 text-amber-400"
                    : "bg-blue-500/10 text-blue-400"
              }`}>{sub.status.toLowerCase().replace(/_/g, " ")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
