import { Suspense } from 'react'
import { EditOrderWrapper } from './client-wrapper'

interface EditOrderPageProps {
  params: Promise<{ id: string }>
}

function EditOrderLoader() {
  return <div>Cargando pedido para editar...</div>
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<EditOrderLoader />}>
      <EditOrderWrapper id={id} />
    </Suspense>
  )
}
