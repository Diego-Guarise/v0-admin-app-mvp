'use client'

import { AdminLayout } from '@/components/admin-layout'
import { VendorForm } from '@/components/vendedores/vendor-form'

export default function NuevoVendedorPage() {
  return (
    <AdminLayout>
      <VendorForm />
    </AdminLayout>
  )
}
