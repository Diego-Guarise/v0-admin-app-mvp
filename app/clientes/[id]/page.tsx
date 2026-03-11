import { AdminLayout } from '@/components/admin-layout'
import { ClientDetail } from '@/components/clients/client-detail'
import { notFound } from 'next/navigation'
import { CLIENTS } from '@/lib/mock-data'

interface ClientDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params
  const client = CLIENTS.find(c => c.id === id)

  if (!client) {
    notFound()
  }

  return (
    <AdminLayout>
      <ClientDetail client={client} />
    </AdminLayout>
  )
}
