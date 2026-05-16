'use client'

import { useMemo, useState, useEffect } from 'react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertTriangle, Save, ArrowUp, ArrowDown } from 'lucide-react'
import { getAllPrices, savePrices } from '@/lib/price-store'
import { PRODUCTS, PRESENTATIONS, formatCurrency } from '@/lib/mock-data'
import { PRICE_CATEGORY_LABELS } from '@/lib/types'
import type { PriceListItem, PriceCategory } from '@/lib/types'
import { selectIfZero } from '@/lib/utils'

type SortKey = 'product' | 'presentation' | 'category' | 'kilos' | 'price' | 'pricePerKg' | null
type SortOrder = 'asc' | 'desc' | null

export function PreciosContent() {
  const [prices, setPrices] = useState<PriceListItem[]>([])
  const [filterProduct, setFilterProduct] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<PriceCategory | 'all'>('all')
  const [filterBrand, setFilterBrand] = useState<'all' | 'con' | 'sin'>('all')
  const [hasChanges, setHasChanges] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load prices from localStorage only on client after mount
  useEffect(() => {
    setPrices(getAllPrices())
    setIsHydrated(true)
  }, [])

  const filteredPrices = useMemo(() => {
    let result = prices.filter(p => {
      if (filterProduct !== 'all' && p.product_id !== filterProduct) return false
      if (filterCategory !== 'all' && p.price_category !== filterCategory) return false
      if (filterBrand === 'con' && !p.with_brand) return false
      if (filterBrand === 'sin' && p.with_brand) return false
      return true
    })

    // Apply sorting
    if (sortKey && sortOrder) {
      result = [...result].sort((a, b) => {
        let aVal: any = ''
        let bVal: any = ''

        switch (sortKey) {
          case 'product': {
            const prodA = PRODUCTS.find(p => p.id === a.product_id)
            const prodB = PRODUCTS.find(p => p.id === b.product_id)
            aVal = prodA?.name || ''
            bVal = prodB?.name || ''
            break
          }
          case 'presentation': {
            const presA = PRESENTATIONS.find(p => p.id === a.presentation_id)
            const presB = PRESENTATIONS.find(p => p.id === b.presentation_id)
            aVal = presA?.name || ''
            bVal = presB?.name || ''
            break
          }
          case 'category':
            aVal = a.price_category
            bVal = b.price_category
            break
          case 'kilos':
            aVal = a.total_weight_per_sales_unit_kg
            bVal = b.total_weight_per_sales_unit_kg
            break
          case 'price':
            aVal = a.unit_price_for_sales_unit
            bVal = b.unit_price_for_sales_unit
            break
          case 'pricePerKg':
            aVal = a.total_weight_per_sales_unit_kg > 0 ? a.unit_price_for_sales_unit / a.total_weight_per_sales_unit_kg : 0
            bVal = b.total_weight_per_sales_unit_kg > 0 ? b.unit_price_for_sales_unit / b.total_weight_per_sales_unit_kg : 0
            break
        }

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = (bVal as string).toLowerCase()
        }

        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
        }
      })
    }

    return result
  }, [prices, filterProduct, filterCategory, filterBrand, sortKey, sortOrder])

  const handlePriceChange = (id: string, newPrice: number) => {
    setPrices(prices.map(p => p.id === id ? { ...p, unit_price_for_sales_unit: newPrice } : p))
    setHasChanges(true)
  }

  const handleSave = () => {
    savePrices(prices)
    setHasChanges(false)
  }

  const handleSort = (key: SortKey) => {
    // If clicking the same column, cycle through sort orders
    if (sortKey === key) {
      if (sortOrder === null) {
        setSortOrder('asc')
      } else if (sortOrder === 'asc') {
        setSortOrder('desc')
      } else {
        setSortKey(null)
        setSortOrder(null)
      }
    } else {
      // New column - start with ascending
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null
    if (sortOrder === 'asc') return <ArrowUp className="h-4 w-4 ml-1 inline" />
    if (sortOrder === 'desc') return <ArrowDown className="h-4 w-4 ml-1 inline" />
    return null
  }

  // Get unique product names for filter pills
  const productOptions = [
    { value: 'all', label: 'Todos' },
    ...PRODUCTS.map(p => ({ value: p.id, label: p.name }))
  ]

  const categoryOptions = [
    { value: 'all', label: 'Todas' },
    ...Object.entries(PRICE_CATEGORY_LABELS).map(([k, v]) => ({ value: k, label: v }))
  ]

  const brandOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'con', label: 'Con marca' },
    { value: 'sin', label: 'Sin marca' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <PageHeader
          title="Lista de Precios"
          description="Gestiona los precios de venta de todos los productos"
        />

        {/* Quick Filters */}
        <div className="space-y-6">
          {/* Product Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Producto</Label>
            <div className="flex flex-wrap gap-2">
              {productOptions.map(option => (
                <Button
                  key={option.value}
                  variant={filterProduct === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterProduct(option.value)}
                  className="rounded-full"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Categoría</Label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map(option => (
                <Button
                  key={option.value}
                  variant={filterCategory === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCategory(option.value as any)}
                  className="rounded-full"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Marca</Label>
            <div className="flex flex-wrap gap-2">
              {brandOptions.map(option => (
                <Button
                  key={option.value}
                  variant={filterBrand === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterBrand(option.value as any)}
                  className="rounded-full"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Price Table */}
          <Card className="mt-8">
            <CardHeader className="border-b pb-4">
              <div className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{filteredPrices.length} precios</CardTitle>
                <div className="flex gap-2">
                  {hasChanges && (
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar cambios
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow className="hover:bg-background border-b">
                      <TableHead className="font-semibold cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('product')}>
                        Producto {renderSortIcon('product')}
                      </TableHead>
                      <TableHead className="font-semibold cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('presentation')}>
                        Presentación {renderSortIcon('presentation')}
                      </TableHead>
                      <TableHead className="font-semibold">Marca</TableHead>
                      <TableHead className="font-semibold cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('category')}>
                        Categoría {renderSortIcon('category')}
                      </TableHead>
                      <TableHead className="text-center font-semibold">Unidad de venta</TableHead>
                      <TableHead className="text-center font-semibold cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('kilos')}>
                        Kilos totales {renderSortIcon('kilos')}
                      </TableHead>
                      <TableHead className="text-center font-semibold cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('price')}>
                        Precio por unidad de venta {renderSortIcon('price')}
                      </TableHead>
                      <TableHead className="text-center font-semibold cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('pricePerKg')}>
                        Precio por kg {renderSortIcon('pricePerKg')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrices.map((price, index) => {
                      const product = PRODUCTS.find(p => p.id === price.product_id)
                      const presentation = PRESENTATIONS.find(p => p.id === price.presentation_id)
                      const precioPerKg = price.total_weight_per_sales_unit_kg > 0 
                        ? price.unit_price_for_sales_unit / price.total_weight_per_sales_unit_kg 
                        : 0
                      return (
                        <TableRow 
                          key={price.id}
                          className={`hover:bg-accent/50 transition-colors ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}
                        >
                          <TableCell className="font-semibold text-foreground">{product?.name || 'N/A'}</TableCell>
                          <TableCell className="text-sm">{presentation?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                              price.with_brand 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {price.with_brand ? 'Con marca' : 'Sin marca'}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{PRICE_CATEGORY_LABELS[price.price_category]}</TableCell>
                          <TableCell className="text-center">
                            <span className="inline-block rounded-full px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary">
                              {price.sales_unit_type === 'funda' ? 'Funda' : 'Unidad'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-sm">{price.total_weight_per_sales_unit_kg} kg</TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              value={price.unit_price_for_sales_unit}
                              onChange={(e) => handlePriceChange(price.id, parseFloat(e.target.value) || 0)}
                              onFocus={selectIfZero}
                              className="w-24 text-center mx-auto"
                              step="1"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-bold text-primary">{formatCurrency(precioPerKg)}</span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              {filteredPrices.length === 0 && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  No hay precios que cumplan los filtros
                </div>
              )}
            </CardContent>
          </Card>

          {hasChanges && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex items-center gap-3 pt-6">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">Cambios sin guardar</p>
                  <p className="text-sm text-amber-700">Los cambios en los precios no se aplicarán hasta que los guardes</p>
                </div>
                <Button onClick={handleSave} size="sm">Guardar ahora</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
