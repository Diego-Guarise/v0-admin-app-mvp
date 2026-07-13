// Client-side API wrapper for the Clientes module.
// Single source of truth: /api/clients + /api/clients/[id] backed by PostgreSQL/Neon.
// No localStorage. No seed data.

import type { Client } from '@/lib/types'

export interface ClientInput {
  name?: string | null
  rut?: string | null
  company?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  notes?: string | null
  active?: boolean
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `La solicitud falló (${res.status})`
    try {
      const data = await res.json()
      if (data?.error) message = data.error
    } catch {
      // response had no JSON body; keep default message
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

// GET /api/clients — full list (active + inactive)
export async function getClients(): Promise<Client[]> {
  const res = await fetch('/api/clients', { cache: 'no-store' })
  return handle<Client[]>(res)
}

// GET /api/clients/[id] — returns null when the client does not exist
export async function getClientById(id: string): Promise<Client | null> {
  const res = await fetch(`/api/clients/${id}`, { cache: 'no-store' })
  if (res.status === 404) return null
  return handle<Client>(res)
}

// POST /api/clients
export async function createClient(data: ClientInput): Promise<Client> {
  const res = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handle<Client>(res)
}

// PUT /api/clients/[id]
export async function updateClient(id: string, data: ClientInput): Promise<Client> {
  const res = await fetch(`/api/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handle<Client>(res)
}

// DELETE /api/clients/[id] — soft delete (sets active = false)
export async function deactivateClient(id: string): Promise<Client> {
  const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
  return handle<Client>(res)
}
