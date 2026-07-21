export const dynamic = "force-dynamic"

import { prisma } from "@/lib/db/prisma"

export default async function AdminOverviewPage() {
  const [pendingSubmissions, totalUsers, totalProjects, shipments] = await Promise.all([
    prisma.submission.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.user.count(),
    prisma.project.count(),
    prisma.shipment.count({ where: { status: "PREPARING" } }),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overview</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold">{pendingSubmissions}</p>
          <p className="text-sm text-muted">Pending reviews</p>
        </div>
        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold">{totalUsers}</p>
          <p className="text-sm text-muted">Total users</p>
        </div>
        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold">{totalProjects}</p>
          <p className="text-sm text-muted">Projects</p>
        </div>
        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold">{shipments}</p>
          <p className="text-sm text-muted">Pending shipments</p>
        </div>
      </div>
    </div>
  )
}
