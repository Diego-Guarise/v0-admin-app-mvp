'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { ClientForm } from '@/components/clients/client-form'
import { useRouter } from 'next/navigation'
import { getClientById } from '@/lib/client-store'
import type { Client } from '@/lib/types'

interface EditClientPageProps {
  params: Promise<{ id: string }>
}

export default function EditClientPage({ params }: EditClientPageProps) {
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [id, setId] = useState<string>('')

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    
    const foundClient = getClientById(id)
    console.log('[v0] Edit page: Looking for client', id, 'Found:', foundClient ? { id: foundClient.id, name: foundClient.name } : 'NOT FOUND')
    
    if (!foundClient) {
      router.push('/404')
      return
    }
    
    setClient(foundClient)
    setIsLoading(false)
  }, [id, router])

  if (isLoading) {
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
          <p className="text-red-600">Cliente no encontrado</p>
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
