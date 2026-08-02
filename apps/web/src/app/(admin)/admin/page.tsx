export const dynamic = "force-dynamic"

import { prisma } from "@/lib/db/prisma"
import { requireRole } from "@/lib/auth/require-role"
import { UnauthorizedError, ForbiddenError } from "@/lib/auth/get-auth-user"
import { redirect } from "next/navigation"
import Link from "next/link"

const ACCENT = "#FF1500"

function StatCard({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="border-2 p-4" style={{ borderColor: accent ? ACCENT : "var(--fg)" }}>
      <p className="text-3xl font-display font-extrabold" style={{ color: accent ? ACCENT : "var(--fg)" }}>
        {value}
      </p>
      <p className="text-xs uppercase tracking-widest mt-1" style={{ color: "var(--muted)" }}>
        {label}
      </p>
    </div>
  )
}

function BreakdownBar({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  if (total === 0) {
    return (
      <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
        No data yet
      </p>
    )
  }

  return (
    <div>
      <div className="flex h-3 w-full border-2 overflow-hidden" style={{ borderColor: "var(--fg)" }}>
        {segments.map((s) => (
          <div
            key={s.label}
            style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs uppercase tracking-widest">
            <span className="inline-block w-2 h-2" style={{ backgroundColor: s.color }} />
            <span style={{ color: "var(--muted)" }}>
              {s.label} <span style={{ color: "var(--fg)" }}>{s.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * A project can be COMPLETED on multiple tiers at once (e.g. finished T1, T2,
 * and T3), so this is a funnel — one independent bar per tier showing how
 * many projects cleared it out of the total — not a stacked partition like
 * BreakdownBar, which would incorrectly assume each project only counts once.
 */
function TierFunnel({ rows, total }: { rows: { label: string; value: number; color: string }[]; total: number }) {
  if (total === 0) {
    return (
      <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
        No projects yet
      </p>
    )
  }

  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex items-center justify-between text-xs uppercase tracking-widest mb-1">
            <span style={{ color: "var(--muted)" }}>{r.label} completed</span>
            <span style={{ color: "var(--fg)" }}>{r.value} / {total}</span>
          </div>
          <div className="h-2 w-full border-2" style={{ borderColor: "var(--fg)" }}>
            <div style={{ width: `${(r.value / total) * 100}%`, height: "100%", backgroundColor: r.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function timeAgo(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000)
  if (days === 0) return "today"
  if (days === 1) return "1 day ago"
  return `${days} days ago`
}

export default async function AdminOverviewPage() {
  try {
    await requireRole("REVIEWER")
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/api/auth/login")
    }
    if (err instanceof ForbiddenError) {
      redirect("/")
    }
    throw err
  }

  const [
    submissionsByStatus,
    completedTierProgress,
    totalProjects,
    shipmentsByStatus,
    totalUsers,
    bannedUsers,
    oldestPending,
    oldestPreparing,
  ] = await Promise.all([
    prisma.submission.groupBy({ by: ["status"], _count: true }),
    prisma.tierProgress.groupBy({ by: ["tier"], where: { status: "COMPLETED" }, _count: true }),
    prisma.project.count(),
    prisma.shipment.groupBy({ by: ["status"], _count: true }),
    prisma.user.count(),
    prisma.user.count({ where: { banned: true } }),
    prisma.submission.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { createdAt: "asc" },
      take: 5,
      include: { user: { select: { firstName: true, lastName: true } }, project: { select: { name: true } } },
    }),
    prisma.shipment.findMany({
      where: { status: "PREPARING" },
      orderBy: { createdAt: "asc" },
      take: 5,
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
  ])

  const count = (rows: { _count: number }[]) => rows.reduce((sum, r) => sum + r._count, 0)
  const countFor = <T extends string>(rows: { [k: string]: any; _count: number }[], key: string, value: T) =>
    rows.find((r) => r[key] === value)?._count ?? 0

  const pendingReview = countFor(submissionsByStatus, "status", "PENDING_REVIEW")
  const changesRequested = countFor(submissionsByStatus, "status", "CHANGES_REQUESTED")
  const approved = countFor(submissionsByStatus, "status", "APPROVED")
  const preparingShipments = countFor(shipmentsByStatus, "status", "PREPARING")

  return (
    <div>
      <h1 className="text-2xl font-display font-extrabold uppercase tracking-tight mb-8">
        Overview<span style={{ color: ACCENT }}>.</span>
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard value={pendingReview} label="Pending reviews" accent={pendingReview > 0} />
        <StatCard value={changesRequested} label="Changes requested" />
        <StatCard value={preparingShipments} label="Preparing shipments" accent={preparingShipments > 0} />
        <StatCard value={totalUsers} label="Total users" />
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
            Submissions ({count(submissionsByStatus)})
          </h2>
          <BreakdownBar
            segments={[
              { label: "Pending", value: pendingReview, color: ACCENT },
              { label: "Changes requested", value: changesRequested, color: "#F59E0B" },
              { label: "Approved", value: approved, color: "#22C55E" },
            ]}
          />
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
            Tier completion ({totalProjects} projects)
          </h2>
          <TierFunnel
            total={totalProjects}
            rows={[
              { label: "T1", value: countFor(completedTierProgress, "tier", "T1"), color: "#3B82F6" },
              { label: "T2", value: countFor(completedTierProgress, "tier", "T2"), color: "#A855F7" },
              { label: "T3", value: countFor(completedTierProgress, "tier", "T3"), color: ACCENT },
            ]}
          />
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
            Shipments ({count(shipmentsByStatus)})
          </h2>
          <BreakdownBar
            segments={[
              { label: "Preparing", value: preparingShipments, color: ACCENT },
              { label: "Shipped", value: countFor(shipmentsByStatus, "status", "SHIPPED"), color: "#3B82F6" },
              { label: "Delivered", value: countFor(shipmentsByStatus, "status", "DELIVERED"), color: "#22C55E" },
            ]}
          />
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
            Users ({totalUsers})
          </h2>
          <BreakdownBar
            segments={[
              { label: "Active", value: totalUsers - bannedUsers, color: "#22C55E" },
              { label: "Banned", value: bannedUsers, color: ACCENT },
            ]}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              Oldest pending reviews
            </h2>
            <Link href="/admin/submissions" className="text-xs uppercase tracking-widest" style={{ color: ACCENT }}>
              View all →
            </Link>
          </div>
          {oldestPending.length === 0 ? (
            <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              Nothing waiting on review
            </p>
          ) : (
            <div className="space-y-2">
              {oldestPending.map((s) => (
                <div key={s.id} className="border-2 p-3" style={{ borderColor: "var(--fg)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{s.title}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {s.user.firstName} {s.user.lastName} · {s.project.name} · {s.tier}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-widest" style={{ color: ACCENT }}>
                      {timeAgo(s.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              Oldest preparing shipments
            </h2>
            <Link href="/admin/shipments" className="text-xs uppercase tracking-widest" style={{ color: ACCENT }}>
              View all →
            </Link>
          </div>
          {oldestPreparing.length === 0 ? (
            <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              Nothing waiting to ship
            </p>
          ) : (
            <div className="space-y-2">
              {oldestPreparing.map((s) => (
                <div key={s.id} className="border-2 p-3" style={{ borderColor: "var(--fg)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{s.user.firstName} {s.user.lastName}</p>
                      <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                        {s.tier}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-widest" style={{ color: ACCENT }}>
                      {timeAgo(s.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}