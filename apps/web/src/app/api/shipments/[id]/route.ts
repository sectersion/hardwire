import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import { prisma } from "@/lib/db/prisma"
import { notifyShipmentUpdate } from "@/lib/slack/notify"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const body = await request.json()

    const shipment = await prisma.shipment.update({
      where: { id },
      data: {
        status: body.status,
        trackingUrl: body.trackingUrl,
        carrier: body.carrier,
        shippedAt: body.status === "SHIPPED" ? new Date() : undefined,
        deliveredAt: body.status === "DELIVERED" ? new Date() : undefined,
      },
    })

    await notifyShipmentUpdate({ id: shipment.id, status: shipment.status })

    return NextResponse.json(shipment)
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}
