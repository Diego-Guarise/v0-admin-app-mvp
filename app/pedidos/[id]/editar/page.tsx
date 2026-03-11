import { AdminLayout } from '@/components/admin-layout'
import { OrderForm } from '@/components/orders/order-form'
import { notFound } from 'next/navigation'
import { ORDERS } from '@/lib/mock-data'

interface EditOrderPageProps {
  params: Promise<{ id: string }>
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = await params
  const order = ORDERS.find(o => o.id === id)

  if (!order) {
    notFound()
  }

  return (
    <AdminLayout>
      <OrderForm order={order} />
    </AdminLayout>
  )
}
