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
import { ArrowLeft, Plus, Trash2, Save, AlertTriangle, UserPlus, Package, Scale, Lock, ExternalLink } from 'lucide-react'
import { CLIENTS, PRODUCTS, PRESENTATIONS, ORDERS, formatCurrency, formatWeight } from '@/lib/mock-data'
import { PRICE_CATEGORY_LABELS, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, COMMISSION_STATUS_LABELS } from '@/lib/types'
import { lookupUnitPrice, isPotesAlwaysBranded } from '@/lib/pricing'
import { saveOrder, getOrderById } from '@/lib/order-store'
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
  manual_price: boolean
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
    order?.items.map(item => {
      const presentation = PRESENTATIONS.find(p => p.id === item.presentation_id)
      return {
        id: item.id,
        product_id: item.product_id,
        presentation_id: item.presentation_id,
        with_brand: item.with_brand,
        quantity: item.quantity,
        unit_price: item.unit_price,
        manual_price: false,
      }
    }) || []
  )

  // Active clients only
  const activeClients = useMemo(() => CLIENTS.filter(c => c.active), [])

  // Selected client
  const selectedClient = useMemo(() => 
    CLIENTS.find(c => c.id === clientId), 
    [clientId]
  )

  // Add new item with sensible defaults
  const addItem = () => {
    const defaultProduct = PRODUCTS.find(p => p.id === 'prod-1') || PRODUCTS[0]
    const defaultPres = PRESENTATIONS.find(p => p.product_id === defaultProduct.id && p.type === 'bolsa') || PRESENTATIONS.find(p => p.product_id === defaultProduct.id)
    
    const newItem: OrderItemForm = {
      id: `temp-${Date.now()}`,
      product_id: defaultProduct.id,
      presentation_id: defaultPres?.id || '',
      with_brand: false,
      quantity: 1,
      unit_price: defaultPres ? lookupUnitPrice(
        defaultProduct.id,
        defaultPres.type,
        defaultPres.weight_kg,
        false,
        priceCategory
      ) : 0,
      manual_price: manualPrice,
    }
    setItems([...items, newItem])
  }

  // Remove item
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  // Update item and auto-recalculate price if not manual
  const updateItem = (id: string, field: keyof OrderItemForm, value: string | number | boolean) => {
    setItems(items.map(item => {
      if (item.id !== id) return item
      
      const updatedItem = { ...item, [field]: value }
      
      // Auto-fill price when key fields change (unless manual price mode)
      if (!manualPrice && (field === 'product_id' || field === 'presentation_id' || field === 'with_brand')) {
        const presentation = PRESENTATIONS.find(p => p.id === updatedItem.presentation_id)
        if (presentation) {
          updatedItem.unit_price = lookupUnitPrice(
            updatedItem.product_id,
            presentation.type,
            presentation.weight_kg,
            updatedItem.with_brand,
            priceCategory
          )
        }
      }
      
      return updatedItem
    }))
  }

  // Get valid presentations for selected product (NO DUPLICATES)
  const getValidPresentations = (productId: string) => {
    const presentations = PRESENTATIONS.filter(p => p.product_id === productId && p.active)
    // Use Set to remove duplicates by presentation key (type + weight)
    const seenKeys = new Set<string>()
    const unique: typeof PRESENTATIONS = []
    
    presentations.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'bolsa' ? -1 : 1
      return a.weight_kg - b.weight_kg
    }).forEach(pres => {
      const key = `${pres.type}-${pres.weight_kg}`
      if (!seenKeys.has(key)) {
        seenKeys.add(key)
        unique.push(pres)
      }
    })
    
    return unique
  }

  // Format presentation label (without brand in name)
  const formatPresentationLabel = (pres: typeof PRESENTATIONS[0]) => {
    return `${pres.type === 'bolsa' ? 'Bolsa' : 'Pote'} ${pres.weight_kg} kg`
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
    
    if (!clientId || items.length === 0) {
      alert('Por favor completa cliente y al menos un producto')
      return
    }

    // Create order object
    const newOrder = {
      id: isEditing ? order!.id : `order-${Date.now()}`,
      order_number: isEditing ? order!.order_number : ORDERS.length + 1001,
      order_date: orderDate,
      promised_date: promisedDate,
      client_id: clientId,
      client: selectedClient, // Include client object
      vendor_name: vendorName || '',
      price_category: priceCategory,
      notes,
      manual_price: manualPrice,
      status: isEditing ? status : 'en_produccion' as const,
      payment_status: isEditing ? paymentStatus : 'pendiente' as const,
      commission_status: isEditing ? commissionStatus : 'pendiente_liquidar' as const,
      items: items.map(item => ({
        id: item.id,
        product_id: item.product_id,
        presentation_id: item.presentation_id,
        with_brand: item.with_brand,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      subtotal: calculations.subtotal,
      iva: calculations.iva,
      total: calculations.total,
      enduido_kg: calculations.enduidoKg,
      masilla_kg: calculations.masillaKg,
      created_at: isEditing ? order!.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Persist to order store (in a real app, this would be an API call)
    saveOrder(newOrder as Order)

    console.log('[v0] Order saved:', newOrder)
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
              <CardTitle className="text-base">Información del pedido</CardTitle>
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
                  <Label htmlFor="priceCategory">Categoría de precio *</Label>
                  <Select value={priceCategory} onValueChange={(v) => {
                    setPriceCategory(v as PriceCategory)
                    // Auto-recalculate prices when category changes
                    if (!manualPrice) {
                      setItems(items.map(item => {
                        const presentation = PRESENTATIONS.find(p => p.id === item.presentation_id)
                        if (presentation) {
                          return {
                            ...item,
                            unit_price: lookupUnitPrice(
                              item.product_id,
                              presentation.type,
                              presentation.weight_kg,
                              item.with_brand,
                              v as PriceCategory
                            )
                          }
                        }
                        return item
                      }))
                    }
                  }}>
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

              {/* Manual Price Toggle */}
              <div className={`rounded-xl p-4 border-2 transition-all ${manualPrice ? 'bg-amber-50 border-amber-300' : 'bg-muted/30 border-transparent'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="manualPrice" className="text-sm font-semibold flex items-center gap-2 cursor-pointer">
                      {manualPrice && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                      Usar precio manual
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {manualPrice 
                        ? 'Los precios ingresados manualmente ignoran la lista de precios estándar' 
                        : 'Activa esta opción si necesitas ingresar precios diferentes a la lista'
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
                        <TableHead>Presentación</TableHead>
                        <TableHead className="text-center">Con marca</TableHead>
                        <TableHead className="w-24">Cantidad</TableHead>
                        <TableHead className="w-32">Precio unitario</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const presentation = PRESENTATIONS.find(p => p.id === item.presentation_id)
                        const product = PRODUCTS.find(p => p.id === item.product_id)
                        const potesAlwaysBranded = product && isPotesAlwaysBranded(product.id) && presentation?.type === 'pote'
                        const validPresentations = getValidPresentations(item.product_id)
                        const kg = presentation ? item.quantity * presentation.weight_kg : 0
                        
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Select 
                                value={item.product_id} 
                                onValueChange={(v) => {
                                  // When product changes, batch both updates together
                                  const firstPres = getValidPresentations(v)[0]
                                  setItems(prevItems => prevItems.map(prevItem => {
                                    if (prevItem.id !== item.id) return prevItem
                                    
                                    const updatedItem = { ...prevItem, product_id: v }
                                    
                                    // Also update presentation to first valid one
                                    if (firstPres) {
                                      updatedItem.presentation_id = firstPres.id
                                      // Auto-fill price for new presentation
                                      if (!manualPrice) {
                                        updatedItem.unit_price = lookupUnitPrice(
                                          v,
                                          firstPres.type,
                                          firstPres.weight_kg,
                                          updatedItem.with_brand,
                                          priceCategory
                                        )
                                      }
                                    }
                                    
                                    return updatedItem
                                  }))
                                }}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PRODUCTS.map((prod) => (
                                    <SelectItem key={prod.id} value={prod.id}>
                                      {prod.name}
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
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {validPresentations.map((pres) => (
                                    <SelectItem key={pres.id} value={pres.id}>
                                      {formatPresentationLabel(pres)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-center">
                              {potesAlwaysBranded ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-xs font-semibold">Sí</span>
                                </div>
                              ) : (
                                <Switch
                                  checked={item.with_brand}
                                  onCheckedChange={(v) => updateItem(item.id, 'with_brand', v)}
                                />
                              )}
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
                                readOnly={!manualPrice}
                                className={`w-32 ${manualPrice ? '' : 'bg-muted cursor-default'} ${manualPrice ? 'border-amber-300 bg-amber-50' : ''}`}
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
          {/* Summary */}
          <Card className="shadow-sm sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Enduido</span>
                  <span className="font-semibold">{formatWeight(calculations.enduidoKg)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Masilla</span>
                  <span className="font-semibold">{formatWeight(calculations.masillaKg)}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatCurrency(calculations.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>IVA (22%)</span>
                  <span>{formatCurrency(calculations.iva)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(calculations.total)}</span>
              </div>
            </CardContent>
          </Card>

          {isEditing && (
            <>
              {/* Status */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Estado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm">Estado del pedido</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
                      <SelectTrigger id="status" className="h-10">
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
                    <Label htmlFor="paymentStatus" className="text-sm">Estado de pago</Label>
                    <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
                      <SelectTrigger id="paymentStatus" className="h-10">
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
                    <Label htmlFor="commissionStatus" className="text-sm">Estado de comisión</Label>
                    <Select value={commissionStatus} onValueChange={(v) => setCommissionStatus(v as CommissionStatus)}>
                      <SelectTrigger id="commissionStatus" className="h-10">
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
            </>
          )}
        </div>
      </div>
    </form>
  )
}
