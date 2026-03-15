'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { OrderForm } from '@/components/orders/order-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { getOrderById } from '@/lib/order-store'
import type { Order } from '@/lib/types'

interface EditOrderWrapperProps {
  id: string
}

export function EditOrderWrapper({ id }: EditOrderWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Get navigation context from query params
  const from = searchParams.get('from')
  const vendorId = searchParams.get('vendorId')

  useEffect(() => {
    const foundOrder = getOrderById(id)
    console.log('[v0] Edit page: Looking for order', id, 'Found:', foundOrder ? { id: foundOrder.id, order_number: foundOrder.order_number } : 'NOT FOUND')
    
    if (!foundOrder) {
      // Order not found, redirect to 404
      router.push('/404')
      return
    }
    
    setOrder(foundOrder)
    setIsLoading(false)
  }, [id, router])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-red-600">Pedido no encontrado</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <OrderForm order={order} navigationContext={{ from, vendorId }} />
    </AdminLayout>
  )
}
