'use client'

import { AdminLayout } from '@/components/admin-layout'
import { VendedoresContent } from '@/components/vendedores/vendedores-content'

export default function VendedoresPage() {
  return (
    <AdminLayout>
      <VendedoresContent />
    </AdminLayout>
  )
}
