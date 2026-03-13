'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'
import { VendorForm } from '@/components/vendedores/vendor-form'
import { getVendorById } from '@/lib/vendor-store'
import type { Vendor } from '@/lib/types'

interface EditVendedorPageProps {
  params: Promise<{ id: string }>
}

export default function EditVendedorPage({ params }: EditVendedorPageProps) {
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [id, setId] = useState<string>('')

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    const foundVendor = getVendorById(id)
    if (!foundVendor) {
      router.push('/vendedores')
      return
    }
    setVendor(foundVendor)
  }, [id, router])

  return (
    <AdminLayout>
      <VendorForm vendor={vendor} />
    </AdminLayout>
  )
}
