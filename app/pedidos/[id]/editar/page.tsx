import { AdminLayout } from '@/components/admin-layout'
import { OrderForm } from '@/components/orders/order-form'
import { notFound } from 'next/navigation'
import { getOrderById } from '@/lib/order-store'

interface EditOrderPageProps {
  params: Promise<{ id: string }>
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = await params
  const order = getOrderById(id)

  if (!order) {
    notFound()
  }

  return (
    <AdminLayout>
      <OrderForm order={order} />
    </AdminLayout>
  )
}
