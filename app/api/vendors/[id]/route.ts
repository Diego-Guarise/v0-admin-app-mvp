import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

function serialize(vendor: {
  id: string
  name: string
  phone: string | null
  email: string | null
  commissionPercentage: number
  notes: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: vendor.id,
    name: vendor.name,
    phone: vendor.phone,
    email: vendor.email,
    commission_percentage: vendor.commissionPercentage,
    notes: vendor.notes,
    active: vendor.active,
    created_at: vendor.createdAt.toISOString(),
    updated_at: vendor.updatedAt.toISOString(),
  }
}

// GET /api/vendors/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const vendor = await db.vendor.findUnique({ where: { id } })
    if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(serialize(vendor))
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PUT /api/vendors/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const vendor = await db.vendor.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        phone: body.phone ?? undefined,
        email: body.email ?? undefined,
        commissionPercentage: body.commission_percentage ?? undefined,
        notes: body.notes ?? undefined,
        active: body.active ?? undefined,
      },
    })

    return NextResponse.json(serialize(vendor))
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    const status = (error as { code?: string }).code === 'P2025' ? 404 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}

// DELETE /api/vendors/[id] — soft delete (active = false)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const vendor = await db.vendor.update({
      where: { id },
      data: { active: false },
    })
    return NextResponse.json(serialize(vendor))
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    const status = (error as { code?: string }).code === 'P2025' ? 404 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
