"use client";

import Link from "next/link";
import { InvertExceptRed } from "@/components/invert-except-red";

export interface ProjectTileData {
  id: string;
  name: string;
}

function ProjectTile({ project }: { project: ProjectTileData }) {
  return (
    <Link
      href={`/dashboard/project/${project.id}`}
      data-dashboard-tile
      tabIndex={0}
      className="group relative block shrink-0"
      style={{ width: 214, height: 134 }}
    >
      <InvertExceptRed
        src="/homescreen-assets/relay-project.png"
        alt={project.name}
        width={214}
        height={134}
        style={{ display: "block", width: 214, height: 134, objectFit: "cover" }}
      />
      <div className="absolute bottom-2 left-2">
        <span
          className="font-display font-bold leading-none"
          style={{ fontSize: 12, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
        >
          {project.name}
        </span>
      </div>
    </Link>
  );
}

// Plain sibling block below DashboardTileBoard — deliberately NOT a
// grid item inside it. Placing it as a grid child (even one spanning
// columns) forces the browser to recompute the whole implicit grid's
// auto column sizing, which is what threw off the icon spacing above.
// As a normal block it just starts flush left, same edge as column 1
// (and "New Project"), with no effect on the board's own layout.
export function ProjectRow({ projects }: { projects: ProjectTileData[] }) {
  const columns: ProjectTileData[][] = [];
  for (let i = 0; i < projects.length; i += 2) {
    columns.push(projects.slice(i, i + 2));
  }

  return (
    <div className="flex items-start gap-2 md:gap-3">
      {columns.map((col, i) => (
        <div key={i} className="flex flex-col gap-2 md:gap-3">
          {col[0] && <ProjectTile project={col[0]} />}
          {col[1] && <ProjectTile project={col[1]} />}
        </div>
      ))}
    </div>
  );
}