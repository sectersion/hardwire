import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/page-transition";

const ACCENT = "#FF1500";

const tierLabels: Record<string, string> = {
  T1: "Digital Logic",
  T2: "ASIC Tapeout",
  T3: "Custom Carrier Board",
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      projects: {
        include: { tiers: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user || user.banned) {
    notFound();
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold lowercase leading-none mb-10">
          {user.firstName.toLowerCase()} {user.lastName.toLowerCase()}
          <span style={{ color: ACCENT }}>.</span>
        </h1>

        <div className="flex flex-col gap-4">
          {user.projects.length === 0 && (
            <p className="text-sm opacity-60">No projects yet.</p>
          )}

          {user.projects.map((project) => (
            <div
              key={project.id}
              className="border-2 border-[var(--fg)] p-6 flex flex-col gap-3"
            >
              <div>
                <h2 className="font-display text-lg font-bold">{project.name}</h2>
                {project.description && (
                  <p className="mt-1 text-sm opacity-60">{project.description}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="border-2 border-current px-3 py-1 text-xs font-bold uppercase tracking-wide"
                  >
                    {tier.tier}: {tierLabels[tier.tier] ?? tier.tier} — {tier.status.toLowerCase()}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}