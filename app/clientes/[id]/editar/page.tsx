import { AdminLayout } from '@/components/admin-layout'
import { ClientForm } from '@/components/clients/client-form'
import { notFound } from 'next/navigation'
import { CLIENTS } from '@/lib/mock-data'

interface EditClientPageProps {
  params: Promise<{ id: string }>
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params
  const client = CLIENTS.find(c => c.id === id)

  if (!client) {
    notFound()
  }

  return (
    <AdminLayout>
      <ClientForm client={client} />
    </AdminLayout>
  )
}
