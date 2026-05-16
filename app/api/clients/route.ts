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

// GET /api/clients — list all clients
export async function GET() {
  try {
    const clients = await db.client.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(clients.map(serialize))
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/clients — create a new client
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const client = await db.client.create({
      data: {
        name: body.name ?? null,
        rut: body.rut ?? null,
        company: body.company ?? null,
        phone: body.phone ?? null,
        email: body.email ?? null,
        address: body.address ?? null,
        notes: body.notes ?? null,
        active: body.active ?? true,
      },
    })

    return NextResponse.json(serialize(client), { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
