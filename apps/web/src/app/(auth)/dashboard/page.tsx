export const dynamic = "force-dynamic";

import { DashboardTileBoard } from "@/components/dashboard-tile-board";
import { DashboardZoomStage } from "@/components/dashboard-zoom-stage";
import { IconTile } from "@/components/icon-tile";
import { Leaderboard } from "@/components/leaderboard";
import { ProjectRow, type ProjectTileData } from "@/components/project-tile";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { getCachetUser } from "@/lib/cachet";
import { prisma } from "@/lib/db/prisma";

const ACCENT = "#FF1500";

export default async function DashboardPage() {
  const user = await getAuthUser();
  const [cachetUser, projects] = await Promise.all([
    getCachetUser(user.slackUserId),
    prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const displayName = cachetUser?.displayName || user.firstName;

  const projectData: ProjectTileData[] = projects.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <div className="h-full overflow-hidden">
      <div className="pcb-canvas min-h-full px-4 pb-8 pt-2 md:px-8 md:pb-12 md:pt-4">
        <div aria-hidden="true" className="pcb-load-layers">
          <img className="pcb-intro-layer pcb-intro-components" src="/pcb-layers/Components.svg" alt="" />
          <img className="pcb-intro-layer pcb-intro-silkscreen" src="/pcb-layers/Silkscreen.svg" alt="" />
          <img className="pcb-intro-layer pcb-intro-vias" src="/pcb-layers/Vias.svg" alt="" />
          <img className="pcb-intro-layer pcb-intro-traces-top" src="/pcb-layers/Traces%20Top.svg" alt="" />
          <img className="pcb-intro-layer pcb-intro-green-top" src="/pcb-layers/prepreg.svg" alt="" />
          <img className="pcb-intro-layer pcb-intro-traces-bottom" src="/pcb-layers/Traces%20Bottom.svg" alt="" />
          <img className="pcb-intro-layer pcb-intro-core" src="/pcb-layers/core.svg" alt="" />
        </div>

        <DashboardZoomStage>
          <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="group">
              <h1 className="font-display text-4xl font-extrabold lowercase leading-none md:text-5xl">
                welcome, {displayName.toLowerCase()}
                <span className="hover-period" style={{ color: ACCENT }}>.</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <div className="min-w-0 flex-1">
              <DashboardTileBoard>
                <IconTile
                  gridClassName="col-start-1 row-start-1"
                  href="/dashboard/shop"
                  src="/homescreen-assets/shop-stm32.png"
                  alt="Shop"
                  title="Shop"
                  width={290}
                  height={290}
                />
                <IconTile
                  gridClassName="col-start-1 row-start-2"
                  href="/dashboard/new"
                  src="/homescreen-assets/POT.%20New%20Project.png"
                  alt="New Project"
                  title="New Project"
                  width={215}
                  height={75}
                />
                <IconTile
                  gridClassName="col-start-2 row-start-1"
                  href="/dashboard/explore"
                  src="/homescreen-assets/explore-rp2350.png"
                  alt="Explore"
                  title="Explore"
                  width={230}
                  height={230}
                />
                <IconTile
                  gridClassName="col-start-3 row-start-1"
                  href="/dashboard/docs"
                  src="/homescreen-assets/docs-stm32.png"
                  alt="Docs"
                  title="Docs"
                  width={250}
                  height={250}
                />
                <IconTile
                  gridClassName="col-start-4 row-start-1"
                  href="https://hackclub.enterprise.slack.com/archives/C0BF8115UJK"
                  src="/homescreen-assets/XILINK%20Kintex-7%20SLACK.png"
                  alt="Slack"
                  title="Slack"
                  width={300}
                  height={300}
                  external
                />
              </DashboardTileBoard>

              {/* DashboardTileBoard has pb-6 (24px) bottom padding, so
                  -mt-4 (mobile, -16px) / md:-mt-3 (desktop, -12px)
                  cancels that out, leaving exactly the board's own
                  gap-2/gap-3 (8px/12px) between "New Project" and
                  this row — same spacing as New Project to Shop. */}
              <div className="-mt-4 md:-mt-3">
                <ProjectRow projects={projectData} />
              </div>
            </div>

            <aside className="w-full shrink-0 md:w-[440px]">
              <Leaderboard />
            </aside>
          </div>
        </DashboardZoomStage>
      </div>
    </div>
  );
}