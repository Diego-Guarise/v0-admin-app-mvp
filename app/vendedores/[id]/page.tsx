'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/status-badge'
import { ArrowLeft, Edit, Briefcase, Mail, Phone, Check } from 'lucide-react'
import { getVendorById } from '@/lib/vendor-store'
import { getAllOrders, saveOrder } from '@/lib/order-store'
import { getClientById } from '@/lib/client-store'
import { formatCurrency, formatDate } from '@/lib/mock-data'
import type { Vendor } from '@/lib/types'

interface VendorDetailPageProps {
  params: Promise<{ id: string }>
}

export default function VendorDetailPage({ params }: VendorDetailPageProps) {
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [id, setId] = useState<string>('')
  const [mounted, setMounted] = useState(false)
  const [markingPaid, setMarkingPaid] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Unwrap params
  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  // Ensure mounted before accessing localStorage
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load vendor
  useEffect(() => {
    if (!id || !mounted) return
    const foundVendor = getVendorById(id)
    if (!foundVendor) {
      router.push('/vendedores')
      return
    }
    setVendor(foundVendor)
  }, [id, mounted, router])

  // Get vendor's orders (excluding cancelled)
  const orders = useMemo(() => {
    if (!vendor) return []
    return getAllOrders().filter(o => o.vendor_id === vendor.id && o.status !== 'anulado')
  }, [vendor, refreshKey])

  // Separate orders
  const pendingPaymentOrders = useMemo(() => {
    return orders.filter(o => o.payment_status !== 'cobrado')
  }, [orders, refreshKey])

  const pendingLiquidationOrders = useMemo(() => {
    return orders.filter(o => o.payment_status === 'cobrado' && o.commission_status === 'pendiente_liquidar')
  }, [orders, refreshKey])

  const liquidatedOrders = useMemo(() => {
    return orders.filter(o => o.payment_status === 'cobrado' && o.commission_status === 'liquidado')
  }, [orders, refreshKey])

  // Quick action: mark order as paid
  const handleMarkAsPaid = async (orderId: string) => {
    setMarkingPaid(orderId)
    try {
      const order = getAllOrders().find(o => o.id === orderId)
      if (!order) return

      // Update order: set payment_status to 'cobrado' and set commission_status to 'pendiente_liquidar'
      const updatedOrder = {
        ...order,
        payment_status: 'cobrado' as const,
        commission_status: order.commission_status === 'liquidado' || order.commission_status === 'excluido' 
          ? order.commission_status 
          : 'pendiente_liquidar' as const,
        updated_at: new Date().toISOString(),
      }

      // Save to order-store
      saveOrder(updatedOrder)

      // Force immediate refresh of component state
      // Re-read from order-store to trigger useMemo recalculation
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Error marking order as paid:', error)
    } finally {
      setMarkingPaid(null)
    }
  }

  if (!mounted || !vendor) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/vendedores">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <PageHeader
            title={vendor.name}
            description={`Comisión: ${vendor.commission_percentage}%`}
            icon={Briefcase}
          />
          <Link href={`/vendedores/${vendor.id}/editar`} className="ml-auto">
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </Link>
        </div>

        {/* Vendor Info Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Contact */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm break-all">{vendor.email || '-'}</p>
            </CardContent>
          </Card>

          {/* Phone */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Teléfono</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{vendor.phone || '-'}</p>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{orders.length}</p>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusBadge status={vendor.active ? 'activo' : 'inactivo'} type="client" />
            </CardContent>
          </Card>
        </div>

        {/* Orders Sections */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pedidos Pendientes de Pago</span>
                <span className="text-2xl font-bold text-amber-600">{pendingPaymentOrders.length}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Estos pedidos no están cobrados aún
              </p>
            </CardHeader>
            <CardContent>
              {pendingPaymentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No hay pedidos pendientes</p>
              ) : (
                <div className="space-y-2">
                  {pendingPaymentOrders.map(order => {
                    const client = order.client_id ? getClientById(order.client_id) : undefined
                    const clientName = order.client?.name || client?.name || client?.company || 'Cliente no encontrado'
                    const clientCompany = order.client?.company || client?.company
                    return (
                    <div key={order.id} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <Link href={`/pedidos/${order.id}?from=vendedor&vendorId=${vendor.id}`}>
                        <div className="flex justify-between items-start cursor-pointer">
                          <div>
                            <p className="font-medium">{clientName}</p>
                            {clientCompany && clientCompany !== clientName && (
                              <p className="text-xs text-muted-foreground">{clientCompany}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Pedido #{order.order_number} &middot; {formatDate(order.order_date)}
                            </p>
                          </div>
                          <p className="font-semibold">{formatCurrency(order.total)}</p>
                        </div>
                      </Link>
                      <div className="mt-2 flex gap-2">
                        <Link href={`/pedidos/${order.id}?from=vendedor&vendorId=${vendor.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Ver pedido
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleMarkAsPaid(order.id)}
                          disabled={markingPaid === order.id}
                          className="gap-1"
                        >
                          <Check className="h-4 w-4" />
                          {markingPaid === order.id ? 'Guardando...' : 'Marcar cobrado'}
                        </Button>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Liquidation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pendiente de Liquidación</span>
                <span className="text-2xl font-bold text-blue-600">{pendingLiquidationOrders.length}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Pedidos cobrados no liquidados
              </p>
            </CardHeader>
            <CardContent>
              {pendingLiquidationOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No hay pendientes</p>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {pendingLiquidationOrders.map(order => {
                      const client = order.client_id ? getClientById(order.client_id) : undefined
                      const clientName = order.client?.name || client?.name || client?.company || 'Cliente no encontrado'
                      const clientCompany = order.client?.company || client?.company
                      return (
                      <div key={order.id} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <Link href={`/pedidos/${order.id}?from=vendedor&vendorId=${vendor.id}`}>
                          <div className="flex justify-between items-start cursor-pointer mb-2">
                            <div>
                              <p className="font-medium">{clientName}</p>
                              {clientCompany && clientCompany !== clientName && (
                                <p className="text-xs text-muted-foreground">{clientCompany}</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Pedido #{order.order_number} &middot; {formatDate(order.order_date)}
                              </p>
                            </div>
                            <p className="font-semibold">{formatCurrency(order.subtotal_without_iva || order.subtotal)}</p>
                          </div>
                        </Link>
                        <div className="flex gap-2">
                          <Link href={`/pedidos/${order.id}?from=vendedor&vendorId=${vendor.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              Ver pedido
                            </Button>
                          </Link>
                          <Link href={`/pedidos/${order.id}/editar?from=vendedor&vendorId=${vendor.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              Editar
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )})}
                  </div>
                  <Link href={`/vendedores/${vendor.id}/liquidar`}>
                    <Button className="w-full">Liquidar Comisiones</Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Liquidated Orders */}
        {liquidatedOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Liquidados ({liquidatedOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right">Comisión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liquidatedOrders.map(order => {
                      const baseAmount = order.subtotal_without_iva || order.subtotal
                      const commission = baseAmount * (vendor.commission_percentage / 100)
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            <Link href={`/pedidos/${order.id}`} className="hover:underline">
                              #{order.order_number}
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(order.order_date)}
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(baseAmount)}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(commission)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
