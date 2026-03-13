import { AdminLayout } from '@/components/admin-layout'
import { PreciosContent } from '@/components/precios/precios-content'

export const metadata = {
  title: 'Lista de Precios | FOX Admin',
  description: 'Gestiona los precios de venta de todos los productos',
}

export default function PreciosPage() {
  return (
    <AdminLayout>
      <PreciosContent />
    </AdminLayout>
  )
}
