'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Search, ShoppingCart, Eye, Edit, X, Package, Scale } from 'lucide-react'
import { CLIENTS, formatCurrency, formatDate, formatWeight } from '@/lib/mock-data'
import { getAllOrders } from '@/lib/order-store'
import type { OrderStatus, PaymentStatus } from '@/lib/types'
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/types'

export function OrdersContent() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') as OrderStatus | null
  const initialPayment = searchParams.get('payment') as PaymentStatus | null

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(initialStatus || 'all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>(initialPayment || 'all')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [vendorFilter, setVendorFilter] = useState<string>('all')

  // Get unique vendors from orders
  const vendors = useMemo(() => {
    const vendorSet = new Set<string>()
    getAllOrders().forEach(order => {
      if (order.vendor_name) vendorSet.add(order.vendor_name)
    })
    return Array.from(vendorSet)
  }, [])

  // Filter orders
  const filteredOrders = useMemo(() => {
    return getAllOrders().filter(order => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch = 
          order.order_number.toString().includes(searchLower) ||
          order.client?.name?.toLowerCase().includes(searchLower) ||
          order.client?.company?.toLowerCase().includes(searchLower) ||
          order.vendor_name?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) return false

      // Payment filter
      if (paymentFilter !== 'all' && order.payment_status !== paymentFilter) return false

      // Client filter
      if (clientFilter !== 'all' && order.client_id !== clientFilter) return false

      // Vendor filter
      if (vendorFilter !== 'all' && order.vendor_name !== vendorFilter) return false

      return true
    }).sort((a, b) => b.order_date.localeCompare(a.order_date))
  }, [search, statusFilter, paymentFilter, clientFilter, vendorFilter])

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setPaymentFilter('all')
    setClientFilter('all')
    setVendorFilter('all')
  }

  const hasFilters = search || statusFilter !== 'all' || paymentFilter !== 'all' || clientFilter !== 'all' || vendorFilter !== 'all'

  // Calculate totals for filtered orders
  const totals = useMemo(() => {
    return filteredOrders.reduce(
      (acc, o) => ({
        subtotal: acc.subtotal + o.subtotal,
        total: acc.total + o.total,
        enduidoKg: acc.enduidoKg + o.enduido_kg,
        masillaKg: acc.masillaKg + o.masilla_kg,
      }),
      { subtotal: 0, total: 0, enduidoKg: 0, masillaKg: 0 }
    )
  }, [filteredOrders])

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <PageHeader 
        title="Pedidos"
        description={`${filteredOrders.length} pedido${filteredOrders.length !== 1 ? 's' : ''}`}
      >
        <Link href="/pedidos/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Pedido
          </Button>
        </Link>
      </PageHeader>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por numero, cliente o vendedor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Clear filters */}
              {hasFilters && (
                <Button variant="ghost" onClick={clearFilters} className="shrink-0">
                  <X className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Status filter */}
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Payment filter */}
              <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as PaymentStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Cobro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los cobros</SelectItem>
                  {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Client filter */}
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {CLIENTS.filter(c => c.active).map((client) => (
                    <SelectItem key={client.id} value={client.id}>{client.name || 'Sin nombre'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Vendor filter */}
              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Vendedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los vendedores</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      {filteredOrders.length > 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-20">#</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cobro</TableHead>
                    <TableHead className="w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="group hover:bg-accent/50">
                      <TableCell>
                        <Link href={`/pedidos/${order.id}`} className="font-bold text-primary hover:underline">
                          {order.order_number}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(order.order_date)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.client?.name || 'Sin nombre'}</p>
                          {order.client.company && (
                            <p className="text-xs text-muted-foreground">{order.client.company}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.vendor_name || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-muted-foreground">
                        {formatCurrency(order.subtotal)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} type="order" size="sm" showDot />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.payment_status} type="payment" size="sm" showDot />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/pedidos/${order.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/pedidos/${order.id}/editar`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="border-t px-6 py-4 bg-muted/20">
              <div className="flex flex-wrap gap-6 justify-between items-center">
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-muted-foreground">Enduido:</span>
                    <span className="font-semibold">{formatWeight(totals.enduidoKg)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-emerald-600" />
                    <span className="text-muted-foreground">Masilla:</span>
                    <span className="font-semibold">{formatWeight(totals.masillaKg)}</span>
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold ml-2">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold ml-2 text-primary">{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <EmptyState
              icon={ShoppingCart}
              title="No se encontraron pedidos"
              description={hasFilters 
                ? "Intenta ajustar los filtros de busqueda" 
                : "Crea tu primer pedido para comenzar"
              }
              action={
                hasFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                ) : (
                  <Link href="/pedidos/nuevo">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Pedido
                    </Button>
                  </Link>
                )
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
