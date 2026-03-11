'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  ArrowLeft, 
  Edit, 
  Printer,
  User,
  Calendar,
  Tag,
  Package,
  Scale,
  FileText,
  Truck,
  CreditCard,
  Percent,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { formatCurrency, formatDate, formatWeight } from '@/lib/mock-data'
import { PRICE_CATEGORY_LABELS } from '@/lib/types'
import type { Order } from '@/lib/types'

interface OrderDetailProps {
  order: Order
}

export function OrderDetail({ order }: OrderDetailProps) {
  const router = useRouter()

  const handleCancel = () => {
    // In real app, this would call an API to cancel the order
    console.log('[v0] Canceling order:', order.id)
    router.push('/pedidos')
  }

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
        {order.status !== 'anulado' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                <XCircle className="h-4 w-4 mr-2" />
                Anular
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Anular Pedido #{order.order_number}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta accion marcara el pedido como anulado. El pedido no se eliminara y podra consultarse en el historial.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Si, anular pedido
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
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

      {/* Status Cards - Separate states */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado del Pedido</p>
                <StatusBadge status={order.status} type="order" showDot />
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado de Cobro</p>
                <StatusBadge status={order.payment_status} type="payment" showDot />
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Comision</p>
                <StatusBadge status={order.commission_status} type="commission" showDot />
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Percent className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Detalle de Productos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Producto</TableHead>
                    <TableHead>Presentacion</TableHead>
                    <TableHead className="text-center">Marca</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">Kg</TableHead>
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
                            Si
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatWeight(item.quantity * item.presentation.weight_kg)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter className="bg-muted/20">
                  <TableRow>
                    <TableCell colSpan={6} className="text-right font-medium">Subtotal sin IVA</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(order.subtotal)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={6} className="text-right font-medium">IVA (22%)</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(order.iva)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/5">
                    <TableCell colSpan={6} className="text-right font-bold text-base">Total</TableCell>
                    <TableCell className="text-right font-bold text-lg text-primary">{formatCurrency(order.total)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          {/* Weight Summary */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Resumen de Kilos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">Enduido Interior</p>
                    <p className="text-2xl font-bold text-blue-800">{formatWeight(order.enduido_kg)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Scale className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Masilla para Yeso</p>
                    <p className="text-2xl font-bold text-emerald-800">{formatWeight(order.masilla_kg)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold text-foreground">{order.client.name}</p>
                {order.client.company && (
                  <p className="text-sm text-muted-foreground">{order.client.company}</p>
                )}
              </div>
              {order.client.phone && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Telefono</p>
                  <p className="text-sm font-medium">{order.client.phone}</p>
                </div>
              )}
              {order.client.email && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm font-medium">{order.client.email}</p>
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
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Informacion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fecha pedido</p>
                  <p className="text-sm font-medium">{formatDate(order.order_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fecha prometida</p>
                  <p className="text-sm font-medium">{formatDate(order.promised_date)}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Categoria de precio</p>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">{PRICE_CATEGORY_LABELS[order.price_category]}</p>
                </div>
              </div>
              {order.vendor_name && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Vendedor</p>
                  <p className="text-sm font-medium">{order.vendor_name}</p>
                </div>
              )}
              {order.manual_price && (
                <div className="flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Precio manual aplicado</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Card */}
          <Card className="shadow-sm bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-primary">Total del Pedido</p>
                <p className="text-3xl font-bold text-primary tracking-tight">
                  {formatCurrency(order.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Sin IVA: {formatCurrency(order.subtotal)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
