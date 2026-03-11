import { AdminLayout } from '@/components/admin-layout'
import { OrdersContent } from '@/components/orders/orders-content'

export default function PedidosPage() {
  return (
    <AdminLayout>
      <OrdersContent />
    </AdminLayout>
  )
}
