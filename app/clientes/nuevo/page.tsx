import { Suspense } from 'react'
import { NuevoClienteWrapper } from './client-wrapper'

function NuevoClienteLoader() {
  return <div>Cargando...</div>
}

export default function NuevoClientePage() {
  return (
    <Suspense fallback={<NuevoClienteLoader />}>
      <NuevoClienteWrapper />
    </Suspense>
  )
}

