'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
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
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { CLIENTS, PRODUCTS, PRESENTATIONS, formatCurrency } from '@/lib/mock-data'
import { PRICE_CATEGORY_LABELS, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/types'
import type { Order, PriceCategory, OrderStatus, PaymentStatus } from '@/lib/types'

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
    // In a real app, this would save to the database
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
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información del pedido</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
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
                <Label htmlFor="client">Cliente *</Label>
                <Select value={clientId} onValueChange={setClientId} required>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLIENTS.filter(c => c.active).map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} {client.company && `(${client.company})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label htmlFor="priceCategory">Categoría de precio *</Label>
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
              <div className="space-y-2 flex items-center gap-4 pt-6">
                <Switch
                  id="manualPrice"
                  checked={manualPrice}
                  onCheckedChange={setManualPrice}
                />
                <Label htmlFor="manualPrice">Usar precio manual</Label>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Productos del pedido</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar producto
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {items.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Presentación</TableHead>
                        <TableHead className="text-center">Marca</TableHead>
                        <TableHead className="w-24">Cantidad</TableHead>
                        <TableHead className="w-32">Precio</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
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
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="w-28"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.quantity * item.unit_price)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={5} className="text-right">Subtotal sin IVA</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(calculations.subtotal)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={5} className="text-right">IVA (22%)</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(calculations.iva)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={5} className="text-right font-bold">Total</TableCell>
                        <TableCell className="text-right font-bold text-primary">{formatCurrency(calculations.total)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay productos agregados</p>
                  <Button type="button" variant="outline" size="sm" onClick={addItem} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar primer producto
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estados</CardTitle>
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
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen</CardTitle>
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
              <div className="flex justify-between text-base pt-2 border-t">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary">{formatCurrency(calculations.total)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3 border-t pt-4">
              <div className="flex justify-between w-full text-sm">
                <span className="text-muted-foreground">Enduido</span>
                <span className="font-medium">{calculations.enduidoKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between w-full text-sm">
                <span className="text-muted-foreground">Masilla</span>
                <span className="font-medium">{calculations.masillaKg.toLocaleString()} kg</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  )
}
