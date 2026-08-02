export const dynamic = "force-dynamic"

import { prisma } from "@/lib/db/prisma"
import { requireAdmin } from "@/lib/auth/require-admin"
import { UnauthorizedError, ForbiddenError } from "@/lib/auth/get-auth-user"
import { redirect } from "next/navigation"

const ACCENT = "#FF1500"

const STATUS_STYLE: Record<string, string> = {
  DELIVERED: "border-green-400 text-green-400",
  SHIPPED: "border-blue-400 text-blue-400",
}

function StatusBadge({ status }: { status: string }) {
  const isPreparing = status === "PREPARING"
  return (
    <span
      className="inline-flex items-center px-2 py-1 text-xs font-bold uppercase tracking-widest border-2"
      style={
        isPreparing
          ? { backgroundColor: ACCENT, borderColor: ACCENT, color: "#000" }
          : undefined
      }
    >
      <span className={!isPreparing ? STATUS_STYLE[status] ?? "border-white text-white" : ""}>
        {status.toLowerCase()}
      </span>
    </span>
  )
}

export default async function AdminShipmentsPage() {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/api/auth/login")
    }
    if (err instanceof ForbiddenError) {
      redirect("/")
    }
    throw err
  }

  const shipments = await prisma.shipment.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { firstName: true, lastName: true } } },
  })

  const pending = shipments.filter((s) => s.status === "PREPARING")

  return (
    <div>
      <h1 className="text-2xl font-display font-extrabold uppercase tracking-tight mb-8">
        Shipments<span style={{ color: ACCENT }}>.</span>
      </h1>

      {pending.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
            Pending ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((s) => (
              <div key={s.id} className="border-2 p-4" style={{ borderColor: ACCENT }}>
                <p className="font-bold">{s.user.firstName} {s.user.lastName}</p>
                <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  {s.tier}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
        All shipments
      </h2>
      <div className="space-y-2">
        {shipments.map((s) => (
          <div key={s.id} className="border-2 p-3" style={{ borderColor: "var(--fg)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{s.user.firstName} {s.user.lastName}</p>
                <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  {s.tier} {s.carrier ? `— ${s.carrier}` : ""}
                </p>
              </div>
              <StatusBadge status={s.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}