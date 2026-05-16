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

// GET /api/vendors — list all vendors
export async function GET() {
  try {
    const vendors = await db.vendor.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(vendors.map(serialize))
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/vendors — create a new vendor
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }
    if (typeof body.commission_percentage !== 'number') {
      return NextResponse.json({ error: 'commission_percentage is required' }, { status: 400 })
    }

    const vendor = await db.vendor.create({
      data: {
        name: body.name,
        phone: body.phone ?? null,
        email: body.email ?? null,
        commissionPercentage: body.commission_percentage,
        notes: body.notes ?? null,
        active: body.active ?? true,
      },
    })

    return NextResponse.json(serialize(vendor), { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
