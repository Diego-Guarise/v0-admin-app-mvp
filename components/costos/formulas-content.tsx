'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowLeft,
  Beaker,
  Package,
  DollarSign,
  Scale
} from 'lucide-react'
import { 
  PRODUCTS,
  PRODUCT_FORMULAS,
  getLatestIngredientCost,
  calculateProductCostPerKg,
  formatCurrencyDecimal, 
  formatNumber
} from '@/lib/mock-data'
import { UNIT_OF_MEASURE_ABBR, INGREDIENT_CATEGORY_LABELS, type IngredientCategory } from '@/lib/types'

export function FormulasContent() {
  const [selectedProduct, setSelectedProduct] = useState<string>('all')

  // Filter formulas by product
  const filteredFormulas = useMemo(() => {
    if (selectedProduct === 'all') {
      return PRODUCT_FORMULAS.filter(f => f.active)
    }
    return PRODUCT_FORMULAS.filter(f => f.product_id === selectedProduct && f.active)
  }, [selectedProduct])

  // Group formulas by product
  const groupedFormulas = useMemo(() => {
    const groups: Record<string, typeof filteredFormulas> = {}
    filteredFormulas.forEach(formula => {
      if (!groups[formula.product_id]) {
        groups[formula.product_id] = []
      }
      groups[formula.product_id].push(formula)
    })
    return groups
  }, [filteredFormulas])

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/costos">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader 
          title="Fórmulas de Productos"
          description="Composición de ingredientes por kg de producto"
        >
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por producto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los productos</SelectItem>
              {PRODUCTS.filter(p => p.active).map(product => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PageHeader>
      </div>

      {/* Formulas by Product */}
      <div className="space-y-8">
        {Object.entries(groupedFormulas).map(([productId, formulas]) => {
          const product = PRODUCTS.find(p => p.id === productId)
          if (!product) return null

          const costPerKg = calculateProductCostPerKg(productId)

          // Calculate cost breakdown
          const costBreakdown = formulas.map(formula => {
            const latestCost = getLatestIngredientCost(formula.insumo_id)
            const unitCost = latestCost?.unit_cost_without_iva || 0
            const totalCost = formula.quantity_per_kg * unitCost
            return {
              formula,
              unitCost,
              totalCost,
              percentage: costPerKg > 0 ? (totalCost / costPerKg) * 100 : 0,
            }
          }).sort((a, b) => b.totalCost - a.totalCost)

          return (
            <Card key={productId} className="shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      product.type === 'enduido' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{product.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {product.type}
                        </Badge>
                        <StatusBadge 
                          status={product.active ? 'activo' : 'inactivo'} 
                          type="client" 
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Costo por kg</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrencyDecimal(costPerKg)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Formula Header */}
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Beaker className="h-4 w-4" />
                    <span>Composición ({formulas.length} ingredientes)</span>
                  </div>

                  {/* Formula Items */}
                  <div className="space-y-3">
                    {costBreakdown.map(({ formula, unitCost, totalCost, percentage }) => (
                      <div 
                        key={formula.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 text-right">
                            <p className="text-sm font-mono font-semibold">
                              {percentage > 0 ? `${percentage.toFixed(1)}%` : '-'}
                            </p>
                          </div>
                          <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{formula.insumo?.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {formula.insumo?.category && INGREDIENT_CATEGORY_LABELS[formula.insumo.category as IngredientCategory]}
                              </Badge>
                              {formula.notes && (
                                <span className="italic">{formula.notes}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm">
                              <Scale className="h-3 w-3 text-muted-foreground" />
                              <span className="font-mono">
                                {formula.quantity_per_kg < 1 
                                  ? `${formatNumber(formula.quantity_per_kg * 1000, 0)} g`
                                  : `${formatNumber(formula.quantity_per_kg, 2)} ${UNIT_OF_MEASURE_ABBR[formula.insumo?.unit_of_measure || 'kg']}`
                                }
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">por kg</p>
                          </div>
                          <Separator orientation="vertical" className="h-8" />
                          <div className="text-right min-w-[80px]">
                            <div className="flex items-center gap-1 justify-end">
                              <DollarSign className="h-3 w-3 text-muted-foreground" />
                              <span className="font-mono font-semibold text-primary">
                                {formatCurrencyDecimal(totalCost)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              ({formatCurrencyDecimal(unitCost)}/{UNIT_OF_MEASURE_ABBR[formula.insumo?.unit_of_measure || 'kg']})
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="font-semibold">Costo total por kg</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrencyDecimal(costPerKg)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {Object.keys(groupedFormulas).length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center">
            <Beaker className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No se encontraron fórmulas</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
