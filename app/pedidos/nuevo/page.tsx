'use client'

import { useSearchParams } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'
import { OrderForm } from '@/components/orders/order-form'

export default function NuevoPedidoPage() {
  const searchParams = useSearchParams()
  const clientId = searchParams.get('client')

  return (
    <AdminLayout>
      <OrderForm preSelectedClientId={clientId || undefined} />
    </AdminLayout>
  )
}
