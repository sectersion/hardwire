export const dynamic = "force-dynamic"

import { prisma } from "@/lib/db/prisma"
import { requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminShipmentsPage() {
  await requireAdmin()

  const shipments = await prisma.shipment.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { firstName: true, lastName: true } } },
  })

  const pending = shipments.filter((s) => s.status === "PREPARING")

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Shipments</h1>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Pending ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map((s) => (
              <div key={s.id} className="rounded-xl border border-white/10 p-4">
                <p className="font-medium">{s.user.firstName} {s.user.lastName}</p>
                <p className="text-sm text-muted">{s.tier}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">All shipments</h2>
      <div className="space-y-2">
        {shipments.map((s) => (
          <div key={s.id} className="rounded-xl border border-white/10 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{s.user.firstName} {s.user.lastName}</p>
                <p className="text-xs text-muted">{s.tier} {s.carrier ? `- ${s.carrier}` : ""}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                s.status === "DELIVERED" ? "bg-green-500/10 text-green-400"
                  : s.status === "SHIPPED" ? "bg-blue-500/10 text-blue-400"
                    : "bg-amber-500/10 text-amber-400"
              }`}>{s.status.toLowerCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
