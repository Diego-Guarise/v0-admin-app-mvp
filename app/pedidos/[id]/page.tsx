import { AdminLayout } from '@/components/admin-layout'
import { OrderDetail } from '@/components/orders/order-detail'
import { notFound } from 'next/navigation'
import { getOrderById } from '@/lib/order-store'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const order = getOrderById(id)

  if (!order) {
    notFound()
  }

  return (
    <AdminLayout>
      <OrderDetail order={order} />
    </AdminLayout>
  )
}
