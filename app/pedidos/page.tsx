import { Suspense } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { OrdersContent } from '@/components/orders/orders-content'

function PedidosLoader() {
  return <div className="flex items-center justify-center py-12"><p>Cargando pedidos...</p></div>
}

export default function PedidosPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<PedidosLoader />}>
        <OrdersContent />
      </Suspense>
    </AdminLayout>
  )
}
