import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

function serialize(client: {
  id: string
  name: string | null
  rut: string | null
  company: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: client.id,
    name: client.name,
    rut: client.rut,
    company: client.company,
    phone: client.phone,
    email: client.email,
    address: client.address,
    notes: client.notes,
    active: client.active,
    created_at: client.createdAt.toISOString(),
    updated_at: client.updatedAt.toISOString(),
  }
}

// GET /api/clients/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await db.client.findUnique({ where: { id } })
    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(serialize(client))
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PUT /api/clients/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const client = await db.client.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        rut: body.rut ?? undefined,
        company: body.company ?? undefined,
        phone: body.phone ?? undefined,
        email: body.email ?? undefined,
        address: body.address ?? undefined,
        notes: body.notes ?? undefined,
        active: body.active ?? undefined,
      },
    })

    return NextResponse.json(serialize(client))
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    const status = (error as { code?: string }).code === 'P2025' ? 404 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}

// DELETE /api/clients/[id] — soft delete (active = false)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await db.client.update({
      where: { id },
      data: { active: false },
    })
    return NextResponse.json(serialize(client))
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    const status = (error as { code?: string }).code === 'P2025' ? 404 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
