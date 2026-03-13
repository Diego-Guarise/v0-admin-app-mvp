'use client'

import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'
import { ClientForm } from '@/components/clients/client-form'

export default function NuevoClientePage() {
  const router = useRouter()

  const handleSave = () => {
    router.push('/clientes')
  }

  return (
    <AdminLayout>
      <ClientForm onSave={handleSave} />
    </AdminLayout>
  )
}
