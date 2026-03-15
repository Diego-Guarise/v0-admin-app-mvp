import { Suspense } from 'react'
import { OrderDetailWrapper } from './client-wrapper'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

function OrderDetailLoader() {
  return <div>Cargando pedido...</div>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<OrderDetailLoader />}>
      <OrderDetailWrapper id={id} />
    </Suspense>
  )
}
