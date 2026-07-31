export const dynamic = "force-dynamic";

import { PageTransition } from "@/components/page-transition";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { prisma } from "@/lib/db/prisma";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { getCachetUser } from "@/lib/cachet";
import Link from "next/link";

const ACCENT = "#FF1500";

const tierLabels: Record<string, string> = {
  T1: "Digital Logic",
  T2: "ASIC Tapeout",
  T3: "Custom Carrier Board",
};

export default async function DashboardPage() {
  const user = await getAuthUser();
  const [projects, cachetUser] = await Promise.all([
    prisma.project.findMany({
      where: { userId: user.id },
      include: {
        tiers: true,
        submissions: { orderBy: { createdAt: "desc" }, take: 5 },
      },
      orderBy: { createdAt: "desc" },
    }),
    getCachetUser(user.slackUserId),
  ]);

  const displayName = cachetUser?.displayName || user.firstName;

  const tiersCompleted = projects.reduce(
    (sum, p) => sum + p.tiers.filter((t) => t.status === "COMPLETED").length,
    0
  );

  const lastProjectAt = projects[0]?.createdAt ?? null;

  const lastSubmissionAt = projects
    .map((p) => p.submissions[0]?.createdAt)
    .filter((d): d is Date => !!d)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  const stats = [
    { label: "projects", value: projects.length },
    { label: "tiers completed", value: tiersCompleted },
    { label: "last project", value: formatTimeAgo(lastProjectAt), isText: true },
    { label: "last submission", value: formatTimeAgo(lastSubmissionAt), isText: true },
  ];

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold lowercase leading-none mb-2">
            welcome, {displayName.toLowerCase()}
            <span style={{ color: ACCENT }}>.</span>
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Track your progress from logic to silicon.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-block border-2 px-6 py-3 font-bold text-sm shrink-0 self-start"
          style={{ borderColor: "var(--fg)", backgroundColor: "var(--fg)", color: "var(--bg)" }}
        >
          New project
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 border-2 border-[var(--fg)] mb-10">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`p-5 ${i > 0 ? "border-l-2 border-[var(--fg)]" : ""} ${
              i >= 2 ? "border-t-2 md:border-t-0 border-[var(--fg)]" : ""
            }`}
          >
            <div
              className={`font-display font-bold leading-none mb-2 ${
                stat.isText ? "text-lg md:text-xl" : "text-4xl md:text-5xl"
              }`}
            >
              {stat.value}
            </div>
            <div className="text-xs uppercase tracking-widest text-[var(--muted)]">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="border-2 border-[var(--fg)] p-12 text-center">
          <h2 className="font-display text-xl font-bold mb-2 lowercase">
            no projects yet<span style={{ color: ACCENT }}>.</span>
          </h2>
          <p className="text-[var(--muted)] mb-6 text-sm">
            Start your hardware engineering journey.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-block border-2 px-6 py-3 font-bold text-sm"
            style={{ borderColor: "var(--fg)", backgroundColor: "var(--fg)", color: "var(--bg)" }}
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/project/${project.id}`}
              className="group block border-2 border-[var(--fg)] p-6 transition-colors hover:bg-[var(--fg)] hover:text-[var(--bg)]"
            >
              <div className="flex items-start justify-between mb-4 gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold">
                    {project.name}
                  </h2>
                  {project.description && (
                    <p className="text-sm opacity-60 mt-1">
                      {project.description}
                    </p>
                  )}
                </div>
                <span className="text-xs opacity-50 shrink-0">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {project.tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="text-xs px-3 py-1 border-2 border-current font-bold uppercase tracking-wide"
                  >
                    {tier.tier}: {tierLabels[tier.tier] ?? tier.tier} —{" "}
                    {tier.status.toLowerCase()}
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </PageTransition>
  );
}