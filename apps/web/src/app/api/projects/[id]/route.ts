import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });

  if (!project || project.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const description =
    typeof body.description === "string" ? body.description.trim() : undefined;

  if (name !== undefined && name.length === 0) {
    return NextResponse.json({ error: "Name can't be empty" }, { status: 400 });
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description: description || null } : {}),
    },
  });

  return NextResponse.json(updated);
}