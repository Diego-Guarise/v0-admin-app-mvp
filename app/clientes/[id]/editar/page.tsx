'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin-layout'
import { ClientForm } from '@/components/clients/client-form'
import { Button } from '@/components/ui/button'
import { getClientById } from '@/lib/client-store'
import type { Client } from '@/lib/types'

interface EditClientPageProps {
  params: Promise<{ id: string }>
}

export default function EditClientPage({ params }: EditClientPageProps) {
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [id, setId] = useState<string>('')

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) {
      setIsLoading(true)
      return
    }
    
    const foundClient = getClientById(id)
    
    if (!foundClient) {
      setClient(null)
      setIsLoading(false)
      return
    }
    
    setClient(foundClient)
    setIsLoading(false)
  }, [id])

  if (isLoading || !id) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!client) {
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

  return (
    <AdminLayout>
      <ClientForm client={client} />
    </AdminLayout>
  )
}
