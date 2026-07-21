import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/get-auth-user"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const user = await getAuthUser()
    const shipments = await prisma.shipment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(shipments)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
