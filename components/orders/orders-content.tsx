'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from 'lucide-react'
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
import { formatCurrency, formatDate, formatWeight } from '@/lib/mock-data'
import { getAllOrders } from '@/lib/order-store'
import { getAllClients } from '@/lib/client-store'
import { getAllVendors } from '@/lib/vendor-store'
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
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'with' | 'without'>('all')
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'last-month' | 'custom'>('month')
  const [customFromDate, setCustomFromDate] = useState('')
  const [customToDate, setCustomToDate] = useState('')

  // Helper to get date range based on filter
  const getDateRange = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (dateFilter) {
      case 'today':
        return { from: today.toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
      case 'week': {
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        return { from: weekStart.toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
      }
      case 'month': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return { from: monthStart.toISOString().split('T')[0], to: monthEnd.toISOString().split('T')[0] }
      }
      case 'last-month': {
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1)
        return { from: lastMonthStart.toISOString().split('T')[0], to: lastMonthEnd.toISOString().split('T')[0] }
      }
      case 'custom':
        return { from: customFromDate, to: customToDate }
      default:
        return { from: '', to: '' }
    }
  }

  // Get unique vendors from orders for filter display
  const orderVendorIds = useMemo(() => {
    const vendorIdSet = new Set<string>()
    getAllOrders().forEach(order => {
      if (order.vendor_id) vendorIdSet.add(order.vendor_id)
    })
    return Array.from(vendorIdSet)
  }, [])

  // Filter orders
  const filteredOrders = useMemo(() => {
    const dateRange = getDateRange()
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
      if (vendorFilter !== 'all' && order.vendor_id !== vendorFilter) return false

      // Invoice filter
      if (invoiceFilter === 'with' && !order.has_invoice) return false
      if (invoiceFilter === 'without' && order.has_invoice) return false

      // Date range filter
      if (dateRange.from && dateRange.to) {
        const orderDate = order.order_date
        if (orderDate < dateRange.from || orderDate > dateRange.to) return false
      }

      return true
    }).sort((a, b) => {
      // Primary sort: order_number descending (newest first)
      if (b.order_number !== a.order_number) {
        return b.order_number - a.order_number
      }
      // Fallback: created_at descending
      return b.created_at.localeCompare(a.created_at)
    })
  }, [search, statusFilter, paymentFilter, clientFilter, vendorFilter, invoiceFilter, dateFilter, customFromDate, customToDate])

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setPaymentFilter('all')
    setClientFilter('all')
    setVendorFilter('all')
    setInvoiceFilter('all')
    setDateFilter('month')
    setCustomFromDate('')
    setCustomToDate('')
  }

  const hasFilters = search || statusFilter !== 'all' || paymentFilter !== 'all' || clientFilter !== 'all' || vendorFilter !== 'all' || invoiceFilter !== 'all' || dateFilter !== 'month'

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
                  {getAllClients().filter(c => c.active).map((client) => (
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
                  {orderVendorIds.map((vendorId) => {
                    const vendor = getAllVendors().find(v => v.id === vendorId)
                    return vendor ? (
                      <SelectItem key={vendorId} value={vendorId}>{vendor.name}</SelectItem>
                    ) : null
                  })}
                </SelectContent>
              </Select>

              {/* Invoice filter */}
              <Select value={invoiceFilter} onValueChange={(v) => setInvoiceFilter(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Factura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="with">Con factura</SelectItem>
                  <SelectItem value="without">Sin factura</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date range filters */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Rango de fechas:
              </span>
              <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes (actual)</SelectItem>
                  <SelectItem value="last-month">Mes anterior</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>

              {dateFilter === 'custom' && (
                <>
                  <Input
                    type="date"
                    value={customFromDate}
                    onChange={(e) => setCustomFromDate(e.target.value)}
                    placeholder="Desde"
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">a</span>
                  <Input
                    type="date"
                    value={customToDate}
                    onChange={(e) => setCustomToDate(e.target.value)}
                    placeholder="Hasta"
                    className="w-32"
                  />
                </>
              )}
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
                    <TableHead className="text-center">Fac</TableHead>
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
                          {order.client?.company && (
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
                      <TableCell className="text-center font-medium">
                        {order.has_invoice ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700">✓</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
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
