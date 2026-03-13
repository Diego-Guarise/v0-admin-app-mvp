'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin-layout'
import { ClientDetail } from '@/components/clients/client-detail'
import { Button } from '@/components/ui/button'
import { getClientById } from '@/lib/client-store'
import type { Client } from '@/lib/types'

interface ClientDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [id, setId] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  // Unwrap params
  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  // Ensure component is mounted before attempting localStorage access
  useEffect(() => {
    setMounted(true)
  }, [])

  // Attempt to retrieve client from store once mounted
  useEffect(() => {
    if (!id || !mounted) {
      return
    }
    
    const foundClient = getClientById(id)
    
    if (foundClient) {
      setClient(foundClient)
      setNotFound(false)
    } else {
      setClient(null)
      setNotFound(true)
    }
    
    setIsLoading(false)
  }, [id, mounted])

  // Show loading while params are being resolved or component is mounting
  if (!id || !mounted || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </AdminLayout>
    )
  }

  // Show not found state
  if (notFound) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Cliente no encontrado</p>
            <Link href="/clientes">
              <Button variant="outline">Volver a clientes</Button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // Show client details
  if (client) {
    return (
      <AdminLayout>
        <ClientDetail client={client} />
      </AdminLayout>
    )
  }

  // Fallback (should not reach here)
  return (
    <AdminLayout>
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </AdminLayout>
  )
}
