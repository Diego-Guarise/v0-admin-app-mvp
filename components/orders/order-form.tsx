'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { ArrowLeft, Plus, Trash2, Save, AlertTriangle, UserPlus, Package, Scale } from 'lucide-react'
import { CLIENTS, PRODUCTS, PRESENTATIONS, formatCurrency, formatWeight } from '@/lib/mock-data'
import { PRICE_CATEGORY_LABELS, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, COMMISSION_STATUS_LABELS } from '@/lib/types'
import type { Order, PriceCategory, OrderStatus, PaymentStatus, CommissionStatus } from '@/lib/types'

interface OrderFormProps {
  order?: Order
}

interface OrderItemForm {
  id: string
  product_id: string
  presentation_id: string
  with_brand: boolean
  quantity: number
  unit_price: number
}

export function OrderForm({ order }: OrderFormProps) {
  const router = useRouter()
  const isEditing = !!order

  // Form state
  const [orderDate, setOrderDate] = useState(order?.order_date || new Date().toISOString().split('T')[0])
  const [promisedDate, setPromisedDate] = useState(order?.promised_date || '')
  const [clientId, setClientId] = useState(order?.client_id || '')
  const [vendorName, setVendorName] = useState(order?.vendor_name || '')
  const [priceCategory, setPriceCategory] = useState<PriceCategory>(order?.price_category || 'barraca')
  const [notes, setNotes] = useState(order?.notes || '')
  const [manualPrice, setManualPrice] = useState(order?.manual_price || false)
  const [status, setStatus] = useState<OrderStatus>(order?.status || 'en_produccion')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order?.payment_status || 'pendiente')
  const [commissionStatus, setCommissionStatus] = useState<CommissionStatus>(order?.commission_status || 'pendiente_liquidar')

  // Items state
  const [items, setItems] = useState<OrderItemForm[]>(
    order?.items.map(item => ({
      id: item.id,
      product_id: item.product_id,
      presentation_id: item.presentation_id,
      with_brand: item.with_brand,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })) || []
  )

  // Active clients only
  const activeClients = useMemo(() => CLIENTS.filter(c => c.active), [])

  // Selected client
  const selectedClient = useMemo(() => 
    CLIENTS.find(c => c.id === clientId), 
    [clientId]
  )

  // Add new item
  const addItem = () => {
    setItems([
      ...items,
      {
        id: `temp-${Date.now()}`,
        product_id: PRODUCTS[0].id,
        presentation_id: PRESENTATIONS[0].id,
        with_brand: true,
        quantity: 1,
        unit_price: 0,
      },
    ])
  }

  // Remove item
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  // Update item
  const updateItem = (id: string, field: keyof OrderItemForm, value: string | number | boolean) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  // Calculate totals
  const calculations = useMemo(() => {
    let subtotal = 0
    let enduidoKg = 0
    let masillaKg = 0

    items.forEach(item => {
      const itemSubtotal = item.quantity * item.unit_price
      subtotal += itemSubtotal

      const presentation = PRESENTATIONS.find(p => p.id === item.presentation_id)
      const product = PRODUCTS.find(p => p.id === item.product_id)

      if (presentation && product) {
        const totalKg = item.quantity * presentation.weight_kg
        if (product.type === 'enduido') {
          enduidoKg += totalKg
        } else {
          masillaKg += totalKg
        }
      }
    })

    const iva = subtotal * 0.22
    const total = subtotal + iva

    return { subtotal, iva, total, enduidoKg, masillaKg }
  }, [items])

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[v0] Order submitted:', {
      orderDate,
      promisedDate,
      clientId,
      vendorName,
      priceCategory,
      notes,
      manualPrice,
      status,
      paymentStatus,
      commissionStatus,
      items,
      calculations,
    })
    router.push('/pedidos')
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 lg:px-6 py-6 space-y-6">
      <PageHeader 
        title={isEditing ? `Editar Pedido #${order.order_number}` : 'Nuevo Pedido'}
        description={isEditing ? 'Modifica los datos del pedido' : 'Completa los datos para crear un nuevo pedido'}
      >
        <Link href={isEditing ? `/pedidos/${order.id}` : '/pedidos'}>
          <Button type="button" variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </Link>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Guardar cambios' : 'Crear pedido'}
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Selection */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Cliente</CardTitle>
              <CardDescription>Selecciona un cliente existente o crea uno nuevo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="client" className="sr-only">Cliente</Label>
                  <Select value={clientId} onValueChange={setClientId} required>
                    <SelectTrigger id="client" className="h-12">
                      <SelectValue placeholder="Seleccionar cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{client.name}</span>
                            {client.company && (
                              <span className="text-xs text-muted-foreground">{client.company}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Link href="/clientes/nuevo">
                  <Button type="button" variant="outline" className="h-12">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nuevo
                  </Button>
                </Link>
              </div>
              {selectedClient && (
                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{selectedClient.name}</p>
                    <StatusBadge status={selectedClient.active ? 'activo' : 'inactivo'} type="client" size="sm" />
                  </div>
                  {selectedClient.company && (
                    <p className="text-sm text-muted-foreground">{selectedClient.company}</p>
                  )}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {selectedClient.phone && <span>{selectedClient.phone}</span>}
                    {selectedClient.email && <span>{selectedClient.email}</span>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Informacion del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orderDate">Fecha del pedido *</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promisedDate">Fecha prometida de entrega *</Label>
                  <Input
                    id="promisedDate"
                    type="date"
                    value={promisedDate}
                    onChange={(e) => setPromisedDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendedor</Label>
                  <Input
                    id="vendor"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="Nombre del vendedor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceCategory">Categoria de precio *</Label>
                  <Select value={priceCategory} onValueChange={(v) => setPriceCategory(v as PriceCategory)}>
                    <SelectTrigger id="priceCategory">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRICE_CATEGORY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Manual Price Toggle - More visible */}
              <div className={`rounded-xl p-4 border-2 transition-all ${manualPrice ? 'bg-amber-50 border-amber-300' : 'bg-muted/30 border-transparent'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="manualPrice" className="text-sm font-semibold flex items-center gap-2 cursor-pointer">
                      {manualPrice && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                      Usar precio manual
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {manualPrice 
                        ? 'Los precios ingresados manualmente ignoran la lista de precios estandar' 
                        : 'Activa esta opcion si necesitas ingresar precios diferentes a la lista'
                      }
                    </p>
                  </div>
                  <Switch
                    id="manualPrice"
                    checked={manualPrice}
                    onCheckedChange={setManualPrice}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Productos del pedido</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar producto
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {items.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Producto</TableHead>
                        <TableHead>Presentacion</TableHead>
                        <TableHead className="text-center">Marca</TableHead>
                        <TableHead className="w-24">Cantidad</TableHead>
                        <TableHead className="w-32">Precio</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const presentation = PRESENTATIONS.find(p => p.id === item.presentation_id)
                        const kg = presentation ? item.quantity * presentation.weight_kg : 0
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Select 
                                value={item.product_id} 
                                onValueChange={(v) => updateItem(item.id, 'product_id', v)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PRODUCTS.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={item.presentation_id} 
                                onValueChange={(v) => updateItem(item.id, 'presentation_id', v)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PRESENTATIONS.map((pres) => (
                                    <SelectItem key={pres.id} value={pres.id}>
                                      {pres.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={item.with_brand}
                                onCheckedChange={(v) => updateItem(item.id, 'with_brand', v)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                  className="w-20"
                                />
                                <p className="text-xs text-muted-foreground">{formatWeight(kg)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                className={`w-28 ${manualPrice ? 'border-amber-300 bg-amber-50' : ''}`}
                              />
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(item.quantity * item.unit_price)}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                    <TableFooter className="bg-muted/20">
                      <TableRow>
                        <TableCell colSpan={5} className="text-right font-medium">Subtotal sin IVA</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(calculations.subtotal)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={5} className="text-right font-medium">IVA (22%)</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(calculations.iva)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow className="bg-primary/5">
                        <TableCell colSpan={5} className="text-right font-bold">Total</TableCell>
                        <TableCell className="text-right font-bold text-primary text-lg">{formatCurrency(calculations.total)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No hay productos agregados</p>
                  <Button type="button" variant="outline" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar primer producto
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales del pedido..."
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          {isEditing && (
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Estados</CardTitle>
                <CardDescription>Gestiona los estados del pedido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado del pedido</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentStatus">Estado de cobro</Label>
                  <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
                    <SelectTrigger id="paymentStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commissionStatus">Estado de comision</Label>
                  <Select value={commissionStatus} onValueChange={(v) => setCommissionStatus(v as CommissionStatus)}>
                    <SelectTrigger id="commissionStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(COMMISSION_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card className="shadow-sm border-primary/20 bg-primary/5">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal sin IVA</span>
                <span className="font-medium">{formatCurrency(calculations.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (22%)</span>
                <span className="font-medium">{formatCurrency(calculations.iva)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary">{formatCurrency(calculations.total)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3 border-t pt-4">
              <div className="flex justify-between w-full text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Enduido
                </span>
                <span className="font-semibold">{formatWeight(calculations.enduidoKg)}</span>
              </div>
              <div className="flex justify-between w-full text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Masilla
                </span>
                <span className="font-semibold">{formatWeight(calculations.masillaKg)}</span>
              </div>
            </CardFooter>
          </Card>

          {manualPrice && (
            <div className="rounded-xl bg-amber-50 border-2 border-amber-300 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-800">Precio manual activo</p>
                  <p className="text-xs text-amber-700">
                    Los precios ingresados no corresponden a la lista de precios estandar.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
