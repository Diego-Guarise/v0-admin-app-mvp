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
import { Plus, Search, ShoppingCart, Eye, Edit, X } from 'lucide-react'
import { ORDERS, CLIENTS, formatCurrency, formatDate } from '@/lib/mock-data'
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
    ORDERS.forEach(order => {
      if (order.vendor_name) vendorSet.add(order.vendor_name)
    })
    return Array.from(vendorSet)
  }, [])

  // Filter orders
  const filteredOrders = useMemo(() => {
    return ORDERS.filter(order => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch = 
          order.order_number.toString().includes(searchLower) ||
          order.client.name.toLowerCase().includes(searchLower) ||
          order.client.company?.toLowerCase().includes(searchLower) ||
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
    })
  }, [search, statusFilter, paymentFilter, clientFilter, vendorFilter])

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setPaymentFilter('all')
    setClientFilter('all')
    setVendorFilter('all')
  }

  const hasFilters = search || statusFilter !== 'all' || paymentFilter !== 'all' || clientFilter !== 'all' || vendorFilter !== 'all'

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
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, cliente o vendedor..."
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
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
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
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">#</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Cobro</TableHead>
                    <TableHead className="w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-primary">
                        {order.order_number}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(order.order_date)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.client.name}</p>
                          {order.client.company && (
                            <p className="text-xs text-muted-foreground">{order.client.company}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.vendor_name || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.subtotal)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} type="order" size="sm" />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.payment_status} type="payment" size="sm" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
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
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={ShoppingCart}
              title="No se encontraron pedidos"
              description={hasFilters 
                ? "Intenta ajustar los filtros de búsqueda" 
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
