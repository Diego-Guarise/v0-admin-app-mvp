'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'
import { ClientForm } from '@/components/clients/client-form'
import { Button } from '@/components/ui/button'
import { getClientById } from '@/lib/api/clients'
import type { Client } from '@/lib/types'

interface EditClientPageProps {
  params: Promise<{ id: string }>
}

export default function EditClientPage({ params }: EditClientPageProps) {
  const router = useRouter()
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

  // Retrieve client from the database once mounted
  useEffect(() => {
    if (!id || !mounted) {
      return
    }

    let active = true
    getClientById(id)
      .then(foundClient => {
        if (!active) return
        if (foundClient) {
          setClient(foundClient)
          setNotFound(false)
        } else {
          setClient(null)
          setNotFound(true)
        }
      })
      .catch(() => {
        if (!active) return
        setClient(null)
        setNotFound(true)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, mounted])

  const handleSave = () => {
    router.push('/clientes')
  }

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

  // Show client form
  if (client) {
    return (
      <AdminLayout>
        <ClientForm client={client} onSave={handleSave} />
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
