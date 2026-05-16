'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin-layout'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, DollarSign, Save } from 'lucide-react'
import { getVendorById } from '@/lib/vendor-store'
import { getAllOrders, saveOrder } from '@/lib/order-store'
import { createLiquidacion } from '@/lib/liquidacion-store'
import { formatCurrency, formatDate } from '@/lib/mock-data'
import type { Order, Vendor } from '@/lib/types'

interface LiquidarPageProps {
  params: Promise<{ id: string }>
}

export default function LiquidarPage({ params }: LiquidarPageProps) {
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [id, setId] = useState<string>('')
  const [mounted, setMounted] = useState(false)
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Unwrap params
  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  // Mount
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

  // Get pending liquidation orders
  const pendingOrders = useMemo(() => {
    if (!vendor) return []
    return getAllOrders().filter(
      o => o.vendor_id === vendor.id &&
        o.payment_status === 'cobrado' &&
        o.commission_status === 'pendiente_liquidar'
    )
  }, [vendor])

  // Calculate totals
  const selectedOrders = useMemo(() => {
    return pendingOrders.filter(o => selectedOrderIds.has(o.id))
  }, [pendingOrders, selectedOrderIds])

  const totalBaseWithoutIva = useMemo(() => {
    return selectedOrders.reduce((sum, o) => sum + (o.subtotal_without_iva || o.subtotal), 0)
  }, [selectedOrders])

  const totalCommission = useMemo(() => {
    if (!vendor) return 0
    return totalBaseWithoutIva * (vendor.commission_percentage / 100)
  }, [totalBaseWithoutIva, vendor])

  const handleSelectAll = () => {
    if (selectedOrderIds.size === pendingOrders.length) {
      setSelectedOrderIds(new Set())
    } else {
      setSelectedOrderIds(new Set(pendingOrders.map(o => o.id)))
    }
  }

  const handleToggleOrder = (orderId: string) => {
    const newSet = new Set(selectedOrderIds)
    if (newSet.has(orderId)) {
      newSet.delete(orderId)
    } else {
      newSet.add(orderId)
    }
    setSelectedOrderIds(newSet)
  }

  const handleSubmit = async () => {
    if (!vendor || selectedOrders.length === 0) return

    setIsSubmitting(true)
    try {
      // Create liquidacion record
      createLiquidacion(
        vendor.id,
        selectedOrders.map(o => o.id),
        totalBaseWithoutIva,
        vendor.commission_percentage,
        notes
      )

      // Update selected orders: commission liquidated + order automatically finalized.
      // Business rule: when commission_status = 'liquidado', order status = 'finalizado'.
      // Only payment_status, totals, client, products, vendor_id, and liquidacion_id remain untouched.
      selectedOrders.forEach(order => {
        saveOrder({
          ...order,
          commission_status: 'liquidado',
          status: 'finalizado',
          updated_at: new Date().toISOString(),
        })
      })

      router.push(`/vendedores/${vendor.id}`)
    } catch (error) {
      console.error('Error creating liquidacion:', error)
    } finally {
      setIsSubmitting(false)
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
          <Link href={`/vendedores/${vendor.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <PageHeader
            title="Liquidar Comisiones"
            description={`${vendor.name} - ${vendor.commission_percentage}% comisión`}
            icon={DollarSign}
          />
        </div>

        {pendingOrders.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-muted-foreground">No hay pedidos pendientes de liquidación</p>
            <Link href={`/vendedores/${vendor.id}`}>
              <Button variant="outline" className="mt-4">
                Volver
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Orders Table */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Pedidos Disponibles ({pendingOrders.length})</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {selectedOrderIds.size === pendingOrders.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedOrderIds.size === pendingOrders.length}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Pedido</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                          <TableHead className="text-right">Comisión</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingOrders.map(order => {
                          const baseAmount = order.subtotal_without_iva || order.subtotal
                          const commission = baseAmount * (vendor.commission_percentage / 100)
                          return (
                            <TableRow key={order.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedOrderIds.has(order.id)}
                                  onCheckedChange={() => handleToggleOrder(order.id)}
                                />
                              </TableCell>
                              <TableCell className="font-medium">#{order.order_number}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(order.order_date)}
                              </TableCell>
                              <TableCell className="text-sm">
                                {order.client?.name || 'N/A'}
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
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-4">
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Resumen Liquidación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Selected Orders Count */}
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Pedidos Seleccionados</p>
                    <p className="text-2xl font-bold">{selectedOrders.length}</p>
                  </div>

                  {/* Base Amount */}
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Subtotal Sin IVA</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalBaseWithoutIva)}</p>
                  </div>

                  {/* Commission */}
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground">Comisión Total ({vendor.commission_percentage}%)</p>
                    <p className="text-3xl font-bold text-primary mt-1">{formatCurrency(totalCommission)}</p>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes" className="text-xs">Notas (Opcional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Observaciones sobre esta liquidación..."
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || selectedOrders.length === 0}
                      className="gap-2 w-full"
                    >
                      <Save className="h-4 w-4" />
                      {isSubmitting ? 'Guardando...' : 'Liquidar'}
                    </Button>
                    <Link href={`/vendedores/${vendor.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        Cancelar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
