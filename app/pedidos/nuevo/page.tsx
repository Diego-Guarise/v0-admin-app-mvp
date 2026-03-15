import { Suspense } from 'react'
import { NuevoPedidoWrapper } from './client-wrapper'

function NuevoPedidoLoader() {
  return <div>Cargando...</div>
}

export default function NuevoPedidoPage() {
  return (
    <Suspense fallback={<NuevoPedidoLoader />}>
      <NuevoPedidoWrapper />
    </Suspense>
  )
}
