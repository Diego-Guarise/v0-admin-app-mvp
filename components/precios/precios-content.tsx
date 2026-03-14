'use client'

import { useMemo, useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertTriangle, Save, RotateCcw } from 'lucide-react'
import { getAllPrices, savePrices, resetPrices } from '@/lib/price-store'
import { PRODUCTS, PRESENTATIONS, formatCurrency } from '@/lib/mock-data'
import { PRICE_CATEGORY_LABELS } from '@/lib/types'
import type { PriceListItem, PriceCategory } from '@/lib/types'

export function PreciosContent() {
  const [prices, setPrices] = useState<PriceListItem[]>(getAllPrices())
  const [filterProduct, setFilterProduct] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<PriceCategory | 'all'>('all')
  const [filterBrand, setFilterBrand] = useState<'all' | 'con' | 'sin'>('all')
  const [hasChanges, setHasChanges] = useState(false)

  const filteredPrices = useMemo(() => {
    return prices.filter(p => {
      if (filterProduct !== 'all' && p.product_id !== filterProduct) return false
      if (filterCategory !== 'all' && p.price_category !== filterCategory) return false
      if (filterBrand === 'con' && !p.with_brand) return false
      if (filterBrand === 'sin' && p.with_brand) return false
      return true
    })
  }, [prices, filterProduct, filterCategory, filterBrand])

  const handlePriceChange = (id: string, newPrice: number) => {
    setPrices(prices.map(p => p.id === id ? { ...p, unit_price_for_sales_unit: newPrice } : p))
    setHasChanges(true)
  }

  const handleSave = () => {
    savePrices(prices)
    setHasChanges(false)
  }

  const handleReset = () => {
    if (confirm('¿Estás seguro de que quieres resetear todos los precios a los valores por defecto?')) {
      resetPrices()
      setPrices(getAllPrices())
      setHasChanges(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lista de Precios"
        description="Gestiona los precios de venta de todos los productos"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Producto</Label>
              <Select value={filterProduct} onValueChange={setFilterProduct}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {PRODUCTS.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(PRICE_CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Marca</Label>
              <Select value={filterBrand} onValueChange={(v) => setFilterBrand(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="con">Con marca</SelectItem>
                  <SelectItem value="sin">Sin marca</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{filteredPrices.length} precios</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetear
            </Button>
            {hasChanges && (
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Presentación</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Unidad de venta</TableHead>
                  <TableHead className="text-right">Kilos totales</TableHead>
                  <TableHead className="text-right">Precio por unidad de venta</TableHead>
                  <TableHead className="text-right">Precio por kg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrices.map(price => {
                  const product = PRODUCTS.find(p => p.id === price.product_id)
                  const presentation = PRESENTATIONS.find(p => p.id === price.presentation_id)
                  const precioPerKg = price.total_weight_per_sales_unit_kg > 0 
                    ? price.unit_price_for_sales_unit / price.total_weight_per_sales_unit_kg 
                    : 0
                  return (
                    <TableRow key={price.id}>
                      <TableCell className="font-medium">{product?.name || 'N/A'}</TableCell>
                      <TableCell>{presentation?.name || 'N/A'}</TableCell>
                      <TableCell>{price.with_brand ? 'Con marca' : 'Sin marca'}</TableCell>
                      <TableCell>{PRICE_CATEGORY_LABELS[price.price_category]}</TableCell>
                      <TableCell>{price.sales_unit_type === 'funda' ? 'Funda' : 'Unidad'}</TableCell>
                      <TableCell className="text-right">{price.total_weight_per_sales_unit_kg} kg</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={price.unit_price_for_sales_unit}
                          onChange={(e) => handlePriceChange(price.id, parseFloat(e.target.value) || 0)}
                          className="w-24 text-right"
                          step="1"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(precioPerKg)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {filteredPrices.length === 0 && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              No hay precios que cumplan los filtros
            </div>
          )}
        </CardContent>
      </Card>

      {hasChanges && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">Cambios sin guardar</p>
              <p className="text-sm text-amber-700">Los cambios en los precios no se aplicarán hasta que los guardes</p>
            </div>
            <Button onClick={handleSave} size="sm">Guardar ahora</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
