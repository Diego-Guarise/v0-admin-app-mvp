'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'
import { ClientForm } from '@/components/clients/client-form'

export default function NuevoClientePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const from = searchParams.get('from')
  const returnClientId = searchParams.get('clientId')

  const handleSave = (clientId?: string) => {
    // If coming from pedido, return to pedido with client selected
    if (from === 'pedido' && clientId) {
      router.push(`/pedidos/nuevo?preSelectedClient=${clientId}`)
    } else {
      // Otherwise return to clients list
      router.push('/clientes')
    }
  }

  return (
    <AdminLayout>
      <ClientForm onSave={handleSave} />
    </AdminLayout>
  )
}
