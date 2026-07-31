export const dynamic = "force-dynamic";

import { PageTransition } from "@/components/page-transition";
import { prisma } from "@/lib/db/prisma";
import { getCachetUser, displayNameFor } from "@/lib/cachet";
import { notFound } from "next/navigation";
import Link from "next/link";

const tierLabels: Record<string, string> = {
  T1: "Digital Logic",
  T2: "ASIC Tapeout",
  T3: "Custom Carrier Board",
};

export default async function PublicProjectPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      user: {
        select: { firstName: true, lastName: true, slackUserId: true },
      },
      tiers: true,
    },
  });

  if (!project) {
    notFound();
  }

  const cachetUser = await getCachetUser(project.user.slackUserId);
  const authorName = displayNameFor(project.user, cachetUser);

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/dashboard/explore"
        className="text-sm text-[var(--muted)] hover:text-[var(--fg)] transition-colors mb-6 inline-block"
      >
        &larr; Back to explore
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {cachetUser?.imageUrl && (
            <img
              src={cachetUser.imageUrl}
              alt={authorName}
              className="w-10 h-10 border-2"
              style={{ borderColor: "var(--fg)" }}
            />
          )}
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              {project.name}
            </h1>
            <p className="text-sm text-[var(--muted)]">by {authorName}</p>
          </div>
        </div>

        {project.description && (
          <p className="text-[var(--muted)] max-w-2xl mt-4">{project.description}</p>
        )}

        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm mt-4 border-2 px-3 py-1.5"
            style={{ borderColor: "var(--fg)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 5.8c1.02 0 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.02 2.89-.02 3.29 0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            {project.repoUrl.replace("https://github.com/", "")}
          </a>
        )}
      </div>

      <div className="space-y-3">
        {project.tiers.map((tier) => {
          const label = tierLabels[tier.tier] ?? tier.tier;
          const statusText =
            tier.status === "COMPLETED"
              ? "Completed"
              : tier.status === "ACTIVE"
                ? "In progress"
                : "Locked";

          return (
            <div
              key={tier.id}
              className="border-2 p-5 flex items-center gap-4"
              style={{ borderColor: "var(--fg)", opacity: tier.status === "LOCKED" ? 0.4 : 1 }}
            >
              <div
                className="w-10 h-10 border-2 flex items-center justify-center text-sm font-bold shrink-0"
                style={{ borderColor: "currentColor" }}
              >
                {tier.tier}
              </div>
              <div>
                <h3 className="font-display font-bold">
                  {tier.tier}: {label}
                </h3>
                <p className="text-sm text-[var(--muted)]">{statusText}</p>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </PageTransition>
  );
}