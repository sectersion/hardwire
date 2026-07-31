import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { prisma } from "@/lib/db/prisma";

async function assertOwnedProject(id: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== userId) {
    return null;
  }
  return project;
}

const GITHUB_URL_PATTERN = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  const { id } = await params;

  const project = await assertOwnedProject(id, user.id);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const description =
    typeof body.description === "string" ? body.description.trim() : undefined;
  const repoUrl = typeof body.repoUrl === "string" ? body.repoUrl.trim() : undefined;

  if (name !== undefined && name.length === 0) {
    return NextResponse.json({ error: "Name can't be empty" }, { status: 400 });
  }
  if (repoUrl && !GITHUB_URL_PATTERN.test(repoUrl)) {
    return NextResponse.json(
      { error: "Repository URL must look like https://github.com/username/repo" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description: description || null } : {}),
        ...(repoUrl !== undefined ? { repoUrl: repoUrl || null } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to update project:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update project", detail: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  const { id } = await params;

  const project = await assertOwnedProject(id, user.id);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    // TierProgress and Submission both have onDelete: Cascade back to
    // Project in the schema, so deleting the project alone is enough.
    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete project:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete project", detail: message },
      { status: 500 }
    );
  }
}