'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
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
import { ArrowLeft, Plus, Trash2, Save, AlertTriangle, UserPlus, Package, Scale, Lock, ExternalLink, Copy } from 'lucide-react'
import { PRODUCTS, PRESENTATIONS, ORDERS, formatCurrency, formatWeight } from '@/lib/mock-data'
import { getAllClients } from '@/lib/client-store'
import { getAllVendors } from '@/lib/vendor-store'
import { PRICE_CATEGORY_LABELS, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, COMMISSION_STATUS_LABELS } from '@/lib/types'
import { isPotesAlwaysBranded, getPriceDetailsFromStore, isSoldPerBundle } from '@/lib/pricing'
import { getAllPrices } from '@/lib/price-store'
import { saveOrder, getOrderById, getAllOrders } from '@/lib/order-store'
import type { Order, PriceCategory, OrderStatus, PaymentStatus, CommissionStatus } from '@/lib/types'
import { selectIfZero } from '@/lib/utils'

interface OrderFormProps {
  order?: Order
  preSelectedClientId?: string
  navigationContext?: {
    from: string | null
    vendorId: string | null
  }
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

export function OrderForm({ order, preSelectedClientId, navigationContext }: OrderFormProps) {
  const router = useRouter()
  const isEditing = !!order

  // Determine where to navigate back to based on context
  const getBackPath = () => {
    if (navigationContext?.from === 'vendedor' && navigationContext?.vendorId) {
      return `/vendedores/${navigationContext.vendorId}`
    }
    return isEditing ? `/pedidos/${order!.id}` : '/pedidos'
  }

  // Form state
  const [orderDate, setOrderDate] = useState(order?.order_date || new Date().toISOString().split('T')[0])
  const [promisedDate, setPromisedDate] = useState(order?.promised_date || '')
  const [clientId, setClientId] = useState(order?.client_id || preSelectedClientId || '')
  const [clientSearch, setClientSearch] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [vendorId, setVendorId] = useState(order?.vendor_id || 'none')
  const [priceCategory, setPriceCategory] = useState<PriceCategory>(order?.price_category || 'barraca')
  const [notes, setNotes] = useState(order?.notes || '')
  const [manualPrice, setManualPrice] = useState(order?.manual_price || false)
  const [status, setStatus] = useState<OrderStatus>(order?.status || 'en_produccion')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order?.payment_status || 'pendiente')
  const [commissionStatus, setCommissionStatus] = useState<CommissionStatus>(order?.commission_status || 'pendiente_liquidar')
  const [hasInvoice, setHasInvoice] = useState(order?.has_invoice !== undefined ? order.has_invoice : true)
  const [invoiceNumber, setInvoiceNumber] = useState(order?.invoice_number || '')
  const [vendorError, setVendorError] = useState(false)

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

  // Ref for client dropdown to detect click outside
  const clientDropdownRef = useRef<HTMLDivElement>(null)

  // Active clients only - deferred to avoid hydration mismatch
  const [activeClients, setActiveClients] = useState<ReturnType<typeof getAllClients>>([])

  // Active vendors only - deferred to avoid hydration mismatch
  const [activeVendors, setActiveVendors] = useState<ReturnType<typeof getAllVendors>>([])

  // Load clients and vendors from localStorage on mount
  useEffect(() => {
    setActiveClients(getAllClients().filter(c => c.active))
    setActiveVendors(getAllVendors().filter(v => v.active))
  }, [])

  // Get selected vendor for display
  const selectedVendor = useMemo(() => 
    activeVendors.find(v => v.id === vendorId),
    [vendorId, activeVendors]
  )

  // Selected client
  const selectedClient = useMemo(() => 
    activeClients.find(c => c.id === clientId), 
    [clientId, activeClients]
  )

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return activeClients
    const searchLower = clientSearch.toLowerCase()
    return activeClients.filter(client =>
      (client.name?.toLowerCase().includes(searchLower)) ||
      (client.company?.toLowerCase().includes(searchLower)) ||
      (client.email?.toLowerCase().includes(searchLower)) ||
      (client.phone?.toLowerCase().includes(searchLower)) ||
      (client.rut?.toLowerCase().includes(searchLower))
    )
  }, [clientSearch, activeClients])

  // When preSelectedClientId changes, find and set the client, and clear search
  useEffect(() => {
    if (preSelectedClientId && !clientId) {
      const preSelectedClient = activeClients.find(c => c.id === preSelectedClientId)
      if (preSelectedClient) {
        setClientId(preSelectedClientId)
        setClientSearch('')
        setShowClientDropdown(false)
      }
    }
  }, [preSelectedClientId, activeClients, clientId])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setShowClientDropdown(false)
      }
    }

    if (showClientDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showClientDropdown])

  // Helper: Find the actual presentation_id variant based on product, type, weight, and brand
  // This maps from base presentation (type+weight) to actual variant (with_brand)
  const getPresentationVariant = (productId: string, type: 'bolsa' | 'pote', weightKg: number, withBrand: boolean): string | null => {
    const variant = PRESENTATIONS.find(p =>
      p.product_id === productId &&
      p.type === type &&
      p.weight_kg === weightKg &&
      p.with_brand === withBrand &&
      p.active
    )
    return variant?.id || null
  }

  // Centralized function to resolve a complete, consistent order line state
  const resolveOrderLineState = (
    productId: string,
    presentationId: string,
    withBrand: boolean,
    quantity: number,
    manualPriceMode: boolean,
    priceCat: PriceCategory
  ): {
    product_id: string
    presentation_id: string
    with_brand: boolean
    unit_price: number
    total_weight_kg: number
    isValid: boolean
  } => {
    // Find the product
    const product = PRODUCTS.find(p => p.id === productId)
    if (!product) {
      return {
        product_id: productId,
        presentation_id: '',
        with_brand: false,
        unit_price: 0,
        total_weight_kg: 0,
        isValid: false,
      }
    }

    // If no presentation is selected, return empty state
    if (!presentationId) {
      return {
        product_id: productId,
        presentation_id: '',
        with_brand: false,
        unit_price: 0,
        total_weight_kg: 0,
        isValid: false,
      }
    }

    // Find the selected presentation (base presentation by type+weight)
    const presentation = PRESENTATIONS.find(p => p.id === presentationId)
    if (!presentation || presentation.product_id !== productId) {
      return {
        product_id: productId,
        presentation_id: '',
        with_brand: false,
        unit_price: 0,
        total_weight_kg: 0,
        isValid: false,
      }
    }

    // Determine the correct brand setting
    // For Masilla potes, ALWAYS use with_brand=true
    let resolvedWithBrand = withBrand
    if (isPotesAlwaysBranded(productId) && presentation.type === 'pote') {
      resolvedWithBrand = true
    }

    // Find the variant presentation_id for this type+weight+brand combination
    const variantId = getPresentationVariant(productId, presentation.type, presentation.weight_kg, resolvedWithBrand)
    if (!variantId) {
      // No variant exists for this combination
      return {
        product_id: productId,
        presentation_id: '',
        with_brand: false,
        unit_price: 0,
        total_weight_kg: 0,
        isValid: false,
      }
    }

    // Get price using the variant
    let unitPrice = 0
    if (!manualPriceMode) {
      const priceDetails = getPriceDetailsFromStore(productId, variantId, resolvedWithBrand, priceCat)
      if (priceDetails) {
        unitPrice = priceDetails.unit_price_for_sales_unit
      }
    }

    // Get total weight from price store
    const priceItem = getAllPrices().find(p =>
      p.product_id === productId &&
      p.presentation_id === variantId &&
      p.with_brand === resolvedWithBrand &&
      p.price_category === priceCat
    )

    const totalWeightKg = priceItem?.total_weight_per_sales_unit_kg ?? 0

    return {
      product_id: productId,
      presentation_id: variantId,
      with_brand: resolvedWithBrand,
      unit_price: unitPrice,
      total_weight_kg: totalWeightKg,
      isValid: true,
    }
  }
  const addItem = () => {
    const defaultProduct = PRODUCTS.find(p => p.id === 'prod-1') || PRODUCTS[0]
    // Get the first base presentation (deduplicated by type+weight)
    const defaultBasePresentation = getValidPresentations(defaultProduct.id)[0]
    
    // Resolve the line to ensure it's valid - start with with_brand=false
    const resolvedState = resolveOrderLineState(
      defaultProduct.id,
      defaultBasePresentation?.id || '',
      false,
      1,
      manualPrice,
      priceCategory
    )
    
    const newItem: OrderItemForm = {
      id: `temp-${Date.now()}`,
      product_id: resolvedState.product_id,
      presentation_id: resolvedState.presentation_id,
      with_brand: resolvedState.with_brand,
      quantity: 1,
      unit_price: resolvedState.unit_price,
      manual_price: manualPrice,
    }
    setItems([...items, newItem])
  }

  // Remove item
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  // Duplicate item
  const duplicateItem = (id: string) => {
    const itemToDuplicate = items.find(item => item.id === id)
    if (!itemToDuplicate) return
    
    // Resolve state to ensure the duplicated item is also valid
    const resolvedState = resolveOrderLineState(
      itemToDuplicate.product_id,
      itemToDuplicate.presentation_id,
      itemToDuplicate.with_brand,
      itemToDuplicate.quantity,
      itemToDuplicate.manual_price,
      priceCategory
    )
    
    const duplicatedItem: OrderItemForm = {
      id: `temp-${Date.now()}`,
      product_id: resolvedState.product_id,
      presentation_id: resolvedState.presentation_id,
      with_brand: resolvedState.with_brand,
      quantity: itemToDuplicate.quantity,
      unit_price: resolvedState.unit_price,
      manual_price: itemToDuplicate.manual_price,
    }
    
    // Find the index of the current item and insert after it
    const currentIndex = items.findIndex(item => item.id === id)
    const newItems = [...items]
    newItems.splice(currentIndex + 1, 0, duplicatedItem)
    setItems(newItems)
  }

  // Update item and auto-recalculate price if not manual
  const updateItem = (id: string, field: keyof OrderItemForm, value: string | number | boolean) => {
    setItems(items.map(item => {
      if (item.id !== id) return item
      
      const updatedItem = { ...item, [field]: value }
      
      // When key fields change, resolve the entire line state for consistency
      if (!manualPrice && (field === 'product_id' || field === 'presentation_id' || field === 'with_brand')) {
        const resolvedState = resolveOrderLineState(
          updatedItem.product_id,
          updatedItem.presentation_id,
          updatedItem.with_brand,
          updatedItem.quantity,
          manualPrice,
          priceCategory
        )
        
        updatedItem.product_id = resolvedState.product_id
        updatedItem.presentation_id = resolvedState.presentation_id
        updatedItem.with_brand = resolvedState.with_brand
        updatedItem.unit_price = resolvedState.unit_price
      }
      
      return updatedItem
    }))
  }

  // Helper: Get base presentation ID from variant presentation ID
  // Maps pres-1 (Bolsa 1kg con marca) or pres-2 (Bolsa 1kg sin marca) → first base ID (pres-1)
  const getBasePresentationId = (variantPresentationId: string, productId: string): string => {
    const variantPres = PRESENTATIONS.find(p => p.id === variantPresentationId)
    if (!variantPres) return variantPresentationId
    
    // Find the first presentation for this product/type/weight combination (the base)
    const basePres = PRESENTATIONS.find(p =>
      p.product_id === variantPres.product_id &&
      p.type === variantPres.type &&
      p.weight_kg === variantPres.weight_kg &&
      p.active
    )
    
    return basePres?.id || variantPresentationId
  }

  // Get valid presentations for selected product - DEDUPED by type+weight only
  // This shows the base presentation list without brand variants
  const getValidPresentations = (productId: string) => {
    const presentations = PRESENTATIONS.filter(p => p.product_id === productId && p.active)
    const seen = new Set<string>()
    const deduped: typeof PRESENTATIONS = []
    
    presentations
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'bolsa' ? -1 : 1
        return a.weight_kg - b.weight_kg
      })
      .forEach(pres => {
        const key = `${pres.type}-${pres.weight_kg}`
        if (!seen.has(key)) {
          seen.add(key)
          deduped.push(pres)
        }
      })
    
    return deduped
  }

  // Format presentation label - show base presentation without brand info
  const formatPresentationLabel = (pres: typeof PRESENTATIONS[0]) => {
    const typeLabel = pres.type === 'bolsa' ? 'Bolsa' : 'Pote'
    return `${typeLabel} ${pres.weight_kg} kg`
  }

  // Helper function to get the total weight per sales unit from the price store
  // This respects pack/funda structure (e.g., Enduido 1kg sold by funda=20kg total)
  const getItemTotalWeight = (productId: string, presentationId: string, withBrand: boolean): number => {
    const priceItem = getAllPrices().find(p => 
      p.product_id === productId && 
      p.presentation_id === presentationId && 
      p.with_brand === withBrand &&
      p.price_category === priceCategory
    )
    
    if (priceItem) {
      return priceItem.total_weight_per_sales_unit_kg
    }
    
    // Fallback to presentation weight if price not found
    const presentation = PRESENTATIONS.find(p => p.id === presentationId)
    return presentation?.weight_kg || 0
  }

  // Calculate totals using sales-unit aware weights
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
        // Use sales-unit-aware weight from price store
        const totalKg = item.quantity * getItemTotalWeight(item.product_id, item.presentation_id, item.with_brand)
        if (product.type === 'enduido') {
          enduidoKg += totalKg
        } else {
          masillaKg += totalKg
        }
      }
    })

    // IVA is only calculated if has_invoice is true
    const iva = hasInvoice ? subtotal * 0.22 : 0
    const total = subtotal + iva

    return { subtotal, iva, total, enduidoKg, masillaKg }
  }, [items, hasInvoice, priceCategory])

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!clientId || items.length === 0) {
      alert('Por favor completa cliente y al menos un producto')
      return
    }

    // Vendor is required
    const isVendorMissing = !vendorId || vendorId === 'none'
    setVendorError(isVendorMissing)
    if (isVendorMissing) return

    // Create order object
    const newOrder = {
      id: isEditing ? order!.id : `order-${Date.now()}`,
      order_number: isEditing ? order!.order_number : getAllOrders().length + 1001,
      order_date: orderDate,
      promised_date: promisedDate,
      client_id: clientId,
      client: selectedClient || { id: clientId, active: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, // Include client object or fallback
      vendor_id: vendorId === 'none' ? '' : vendorId,
      vendor_name: vendorId === 'none' ? '' : (selectedVendor?.name || ''),
      price_category: priceCategory,
      notes,
      manual_price: manualPrice,
      status: isEditing ? status : 'en_produccion' as const,
      payment_status: isEditing ? paymentStatus : 'pendiente' as const,
      commission_status: isEditing ? commissionStatus : 'pendiente_liquidar' as const,
      items: items.map(item => {
        const product = PRODUCTS.find(p => p.id === item.product_id)
        const presentation = PRESENTATIONS.find(p => p.id === item.presentation_id)
        return {
          id: item.id,
          product_id: item.product_id,
          product: product || { id: item.product_id, name: 'Producto desconocido', type: 'enduido', active: true },
          presentation_id: item.presentation_id,
          presentation: presentation || { id: item.presentation_id, product_id: item.product_id, name: 'Presentación desconocida', type: 'bolsa', weight_kg: 0, active: true },
          with_brand: item.with_brand,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.quantity * item.unit_price,
        }
      }),
      subtotal: calculations.subtotal,
      iva: calculations.iva,
      total: calculations.total,
      enduido_kg: calculations.enduidoKg,
      masilla_kg: calculations.masillaKg,
      has_invoice: hasInvoice,
      invoice_number: invoiceNumber.trim() || undefined,
      created_at: isEditing ? order!.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Persist to order store (in a real app, this would be an API call)
    saveOrder(newOrder as Order)
    router.push(getBackPath())
  }

  return (
    <form onSubmit={handleSubmit} className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <PageHeader 
        title={isEditing ? `Editar Pedido #${order.order_number}` : 'Nuevo Pedido'}
        description={isEditing ? 'Modifica los datos del pedido' : 'Completa los datos para crear un nuevo pedido'}
      >
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Link href={getBackPath()} className="flex-1 sm:flex-none">
            <Button type="button" variant="ghost" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Cancelar</span>
              <span className="sm:hidden">Atrás</span>
            </Button>
          </Link>
          <Button type="submit" className="flex-1 sm:flex-none">
            <Save className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{isEditing ? 'Guardar cambios' : 'Crear pedido'}</span>
            <span className="sm:hidden">{isEditing ? 'Guardar' : 'Crear'}</span>
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Client Selection */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Cliente</CardTitle>
              <CardDescription>Selecciona un cliente existente o crea uno nuevo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="flex-1 relative min-w-0" ref={clientDropdownRef}>
                  <Label htmlFor="client" className="sr-only">Cliente</Label>
                  <Input
                    id="client"
                    placeholder="Buscar cliente..."
                    value={clientSearch || (selectedClient?.name ? `${selectedClient.name}${selectedClient.company ? ` (${selectedClient.company})` : ''}` : '')}
                    onChange={(e) => {
                      const newValue = e.target.value
                      // If there's a selected client and the user starts editing text
                      if (clientId && selectedClient) {
                        const expectedLabel = `${selectedClient.name}${selectedClient.company ? ` (${selectedClient.company})` : ''}`
                        // If text no longer matches the selected client, clear the selection
                        if (newValue !== expectedLabel && newValue !== '') {
                          setClientId('')
                        }
                      }
                      setClientSearch(newValue)
                      if (newValue.trim()) {
                        setShowClientDropdown(true)
                      }
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    className="h-10 sm:h-12 text-sm"
                  />
                  {showClientDropdown && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-input rounded-md shadow-md max-h-48 overflow-y-auto">
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => {
                              setClientId(client.id)
                              setClientSearch('')
                              setShowClientDropdown(false)
                            }}
                            className="w-full text-left px-3 sm:px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors border-b last:border-b-0"
                          >
                            <div className="font-medium truncate">{client.name}</div>
                            {client.company && <div className="text-xs text-muted-foreground truncate">{client.company}</div>}
                            {(client.email || client.phone) && (
                              <div className="text-xs text-muted-foreground truncate">{[client.email, client.phone].filter(Boolean).join(' • ')}</div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-muted-foreground">No encontrado</div>
                      )}
                    </div>
                  )}
                </div>
                <Link href="/clientes/nuevo?from=pedido" className="flex-shrink-0">
                  <Button type="button" variant="outline" className="h-10 sm:h-12 w-full sm:w-auto text-sm">
                    <UserPlus className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Nuevo</span>
                    <span className="sm:hidden">+</span>
                  </Button>
                </Link>
              </div>
              {selectedClient && (
                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{selectedClient.name || 'Sin nombre'}</p>
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

          {/* Order Information */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Información del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orderDate">Fecha del pedido *</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={orderDate}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
                        setOrderDate(value)
                      }
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promisedDate">Fecha prometida de entrega</Label>
                  <Input
                    id="promisedDate"
                    type="date"
                    value={promisedDate}
                    onChange={(e) => {
                      const value = e.target.value
                      if (!value || /^\d{4}-\d{2}-\d{2}$/.test(value)) {
                        setPromisedDate(value)
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor">
                  Vendedor <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={vendorId}
                  onValueChange={(val) => {
                    setVendorId(val)
                    if (val && val !== 'none') setVendorError(false)
                  }}
                >
                  <SelectTrigger
                    id="vendor"
                    className={vendorError ? 'border-destructive ring-destructive/20 ring-2' : ''}
                  >
                    <SelectValue placeholder="Seleccionar vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin vendedor</SelectItem>
                    {activeVendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name} ({vendor.commission_percentage}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {vendorError && (
                  <p className="text-sm text-destructive">
                    Debes seleccionar un vendedor para crear el pedido
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceCategory">Canal de venta / Categoría de precio *</Label>
                <Select value={priceCategory} onValueChange={(value) => {
                  setPriceCategory(value as PriceCategory)
                  // Recalculate all non-manual prices when category changes
                  setItems(prevItems => 
                    prevItems.map(item => {
                      if (item.manual_price) return item
                      // Use resolveOrderLineState to ensure consistency
                      const resolvedState = resolveOrderLineState(
                        item.product_id,
                        item.presentation_id,
                        item.with_brand,
                        item.quantity,
                        false,
                        value as PriceCategory
                      )
                      return {
                        ...item,
                        presentation_id: resolvedState.presentation_id,
                        with_brand: resolvedState.with_brand,
                        unit_price: resolvedState.unit_price
                      }
                    })
                  )
                }}>
                  <SelectTrigger id="priceCategory">
                    <SelectValue placeholder="Seleccionar categoría de precio" />
                  </SelectTrigger>
                  <SelectContent>
                    {(['barraca', 'distribuidor', 'oferta', 'consumidor_final'] as const).map(category => (
                      <SelectItem key={category} value={category}>
                        {PRICE_CATEGORY_LABELS[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Invoice Toggle */}
              <div className="rounded-xl p-4 border-2 bg-muted/30 border-transparent">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="hasInvoice" className="text-sm font-semibold cursor-pointer">
                      Con factura
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {hasInvoice ? 'IVA 22% incluido' : 'Sin IVA (sin factura)'}
                    </p>
                  </div>
                  <Switch
                    id="hasInvoice"
                    checked={hasInvoice}
                    onCheckedChange={setHasInvoice}
                  />
                </div>
              </div>

              {/* Invoice Number Input */}
              {hasInvoice && (
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber" className="text-sm font-medium">
                    N° de Factura (opcional)
                  </Label>
                  <Input
                    id="invoiceNumber"
                    placeholder="Ej: FAC-2024-001"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>
              )}

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
                        <TableHead className="w-40">Producto</TableHead>
                        <TableHead className="w-40">Presentación</TableHead>
                        <TableHead className="text-center w-16">Marca</TableHead>
                        <TableHead className="w-20">Cantidad</TableHead>
                        <TableHead className="w-28">Precio</TableHead>
                        <TableHead className="text-right w-24">Subtotal</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const presentation = PRESENTATIONS.find(p => p.id === item.presentation_id)
                        const product = PRODUCTS.find(p => p.id === item.product_id)
                        const potesAlwaysBranded = product && isPotesAlwaysBranded(product.id) && presentation?.type === 'pote'
                        const validPresentations = getValidPresentations(item.product_id)
                        // Use sales-unit-aware weight from price store
                        const kg = presentation ? item.quantity * getItemTotalWeight(item.product_id, item.presentation_id, item.with_brand) : 0
                        
                        return (
                          <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell>
                              <Select 
                                value={item.product_id} 
                                onValueChange={(v) => {
                                  // When product changes, batch both updates together
                                  const firstPres = getValidPresentations(v)[0]
                                  setItems(prevItems => prevItems.map(prevItem => {
                                    if (prevItem.id !== item.id) return prevItem
                                    
                                    // Resolve the new state with the new product and first valid presentation
                                    // Keep current with_brand setting when switching products
                                    const resolvedState = resolveOrderLineState(
                                      v,
                                      firstPres?.id || '',
                                      prevItem.with_brand,
                                      prevItem.quantity,
                                      prevItem.manual_price,
                                      priceCategory
                                    )
                                    
                                    return {
                                      ...prevItem,
                                      product_id: resolvedState.product_id,
                                      presentation_id: resolvedState.presentation_id,
                                      with_brand: resolvedState.with_brand,
                                      unit_price: resolvedState.unit_price,
                                    }
                                  }))
                                }}
                              >
                                <SelectTrigger className="w-40 h-9">
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
                                value={getBasePresentationId(item.presentation_id, item.product_id)} 
                                onValueChange={(v) => updateItem(item.id, 'presentation_id', v)}
                              >
                                <SelectTrigger className="w-40 h-9">
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
                                <div className="flex items-center justify-center gap-1">
                                  <Lock className="h-3.5 w-3.5 text-amber-600" />
                                  <span className="text-xs font-semibold">Sí</span>
                                </div>
                              ) : (
                                <Switch
                                  checked={item.with_brand}
                                  onCheckedChange={(v) => updateItem(item.id, 'with_brand', v)}
                                  className="scale-75"
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-0.5">
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                  onFocus={selectIfZero}
                                  className="w-20 h-9 text-center"
                                />
                                <p className="text-xs text-muted-foreground text-center">{formatWeight(kg)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                onFocus={selectIfZero}
                                readOnly={!manualPrice}
                                className={`w-28 h-9 ${manualPrice ? 'border-amber-300 bg-amber-50' : 'bg-muted cursor-default'}`}
                              />
                            </TableCell>
                            <TableCell className="text-right font-semibold text-sm">
                              {formatCurrency(item.quantity * item.unit_price)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                  onClick={() => duplicateItem(item.id)}
                                  title="Duplicar renglón"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => removeItem(item.id)}
                                  title="Eliminar renglón"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
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
