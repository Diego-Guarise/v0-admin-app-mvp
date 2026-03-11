import { AdminLayout } from '@/components/admin-layout'
import { OrderDetail } from '@/components/orders/order-detail'
import { notFound } from 'next/navigation'
import { ORDERS } from '@/lib/mock-data'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const order = ORDERS.find(o => o.id === id)

  if (!order) {
    notFound()
  }

  return (
    <AdminLayout>
      <OrderDetail order={order} />
    </AdminLayout>
  )
}
