'use client'

import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Edit, 
  Printer,
  User,
  Calendar,
  Truck,
  Package,
  Scale,
  FileText
} from 'lucide-react'
import { formatCurrency, formatDate, formatWeight } from '@/lib/mock-data'
import { PRICE_CATEGORY_LABELS } from '@/lib/types'
import type { Order } from '@/lib/types'

interface OrderDetailProps {
  order: Order
}

export function OrderDetail({ order }: OrderDetailProps) {
  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <PageHeader 
        title={`Pedido #${order.order_number}`}
        description={`Creado el ${formatDate(order.created_at)}`}
      >
        <Link href="/pedidos">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <Button variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        <Link href={`/pedidos/${order.id}/editar`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </PageHeader>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estado del pedido</p>
                <div className="mt-2">
                  <StatusBadge status={order.status} type="order" />
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estado de cobro</p>
                <div className="mt-2">
                  <StatusBadge status={order.payment_status} type="payment" />
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total del pedido</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {formatCurrency(order.total)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-lg font-bold text-emerald-700">$</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalle de productos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Presentación</TableHead>
                    <TableHead className="text-center">Marca</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.product.name}</TableCell>
                      <TableCell>{item.presentation.name}</TableCell>
                      <TableCell className="text-center">
                        {item.with_brand ? (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Sí
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={5} className="text-right">Subtotal sin IVA</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(order.subtotal)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5} className="text-right">IVA (22%)</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(order.iva)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5} className="text-right font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold text-primary">{formatCurrency(order.total)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          {/* Weight Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen de kilos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                  <Package className="h-8 w-8 text-emerald-600" />
                  <div>
                    <p className="text-sm text-emerald-700">Enduido Interior</p>
                    <p className="text-xl font-bold text-emerald-800">{formatWeight(order.enduido_kg)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <Scale className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-700">Masilla para Yeso</p>
                    <p className="text-xl font-bold text-blue-800">{formatWeight(order.masilla_kg)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{order.client.name}</p>
                {order.client.company && (
                  <p className="text-sm text-muted-foreground">{order.client.company}</p>
                )}
              </div>
              {order.client.phone && (
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm">{order.client.phone}</p>
                </div>
              )}
              {order.client.email && (
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm">{order.client.email}</p>
                </div>
              )}
              <Separator />
              <Link href={`/clientes/${order.client.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  Ver ficha del cliente
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Fecha del pedido</p>
                  <p className="text-sm font-medium">{formatDate(order.order_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha prometida</p>
                  <p className="text-sm font-medium">{formatDate(order.promised_date)}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground">Categoría de precio</p>
                <p className="text-sm font-medium">{PRICE_CATEGORY_LABELS[order.price_category]}</p>
              </div>
              {order.vendor_name && (
                <div>
                  <p className="text-xs text-muted-foreground">Vendedor</p>
                  <p className="text-sm font-medium">{order.vendor_name}</p>
                </div>
              )}
              {order.manual_price && (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-2">
                  <Truck className="h-4 w-4" />
                  <span>Precio manual aplicado</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
