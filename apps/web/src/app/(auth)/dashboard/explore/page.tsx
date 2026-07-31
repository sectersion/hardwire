export const dynamic = "force-dynamic";

import { PageTransition } from "@/components/page-transition";
import { prisma } from "@/lib/db/prisma";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { getCachetUser, displayNameFor } from "@/lib/cachet";
import Link from "next/link";

const ACCENT = "#FF1500";

const tierLabels: Record<string, string> = {
  T1: "Digital Logic",
  T2: "ASIC Tapeout",
  T3: "Custom Carrier Board",
};

export default async function ExplorePage() {
  const projects = await prisma.project.findMany({
    include: {
      user: {
        select: { firstName: true, lastName: true, slackUserId: true },
      },
      tiers: true,
      submissions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const withNames = await Promise.all(
    projects.map(async (p) => {
      const cachetUser = await getCachetUser(p.user.slackUserId);
      return {
        ...p,
        lastActivityAt: p.submissions[0]?.createdAt ?? p.createdAt,
        authorName: displayNameFor(p.user, cachetUser),
      };
    })
  );

  const sorted = withNames.sort(
    (a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime()
  );

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
      <h1 className="font-display text-4xl md:text-5xl font-extrabold lowercase leading-none mb-3">
        explore<span style={{ color: ACCENT }}>.</span>
      </h1>
      <p className="text-sm text-[var(--muted)] mb-10 max-w-xl">
        Every project in the program, newest activity first.
      </p>

      {sorted.length === 0 ? (
        <div className="border-2 border-[var(--fg)] p-12 text-center">
          <h2 className="font-display text-xl font-bold mb-2 lowercase">
            nothing here yet<span style={{ color: ACCENT }}>.</span>
          </h2>
          <p className="text-[var(--muted)] text-sm">
            Once projects start getting submitted, they&apos;ll show up here.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {sorted.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/explore/${project.id}`}
              className="block border-2 border-[var(--fg)] p-6 transition-colors hover:bg-[var(--fg)] hover:text-[var(--bg)]"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="font-display text-lg font-bold">
                    {project.name}
                  </h2>
                  <p className="text-xs opacity-60 mt-0.5">
                    by {project.authorName}
                  </p>
                </div>
                <span className="text-xs opacity-60 shrink-0">
                  {formatTimeAgo(project.lastActivityAt)}
                </span>
              </div>

              {project.description && (
                <p className="text-sm opacity-70 mb-4">
                  {project.description}
                </p>
              )}

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