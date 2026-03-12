'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Package, 
  Box, 
  Cylinder, 
  Tag,
  CheckCircle2,
  XCircle,
  Beaker,
  DollarSign,
  Info
} from 'lucide-react'
import { 
  PRODUCTS, 
  PRESENTATIONS, 
  PRODUCT_FORMULAS,
  calculateProductCostPerKg,
  getEnvaseCost,
  getEtiquetaCost,
  formatCurrency,
  formatCurrencyDecimal,
  formatNumber,
  formatPercent
} from '@/lib/mock-data'
import { UNIT_OF_MEASURE_ABBR, calculateProfitMargins } from '@/lib/types'

interface ProductDetailProps {
  productId: string
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const product = PRODUCTS.find(p => p.id === productId)
  
  if (!product) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <p className="text-muted-foreground">Producto no encontrado</p>
      </div>
    )
  }

  // Get product presentations
  const presentations = useMemo(() => {
    return PRESENTATIONS.filter(p => p.product_id === productId)
  }, [productId])

  // Get product formula
  const formulas = useMemo(() => {
    return PRODUCT_FORMULAS.filter(f => f.product_id === productId && f.active)
  }, [productId])

  // Calculate cost per kg
  const costPerKg = calculateProductCostPerKg(productId)

  // Group presentations by type and weight
  const groupedPresentations = useMemo(() => {
    const groups: Record<string, typeof presentations> = {}
    
    presentations.forEach(pres => {
      const key = `${pres.type}-${pres.weight_kg}`
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(pres)
    })
    
    return Object.entries(groups).map(([key, items]) => {
      const [type, weight] = key.split('-')
      return {
        type: type as 'bolsa' | 'pote',
        weight_kg: parseFloat(weight),
        presentations: items.sort((a, b) => (a.with_brand ? -1 : 1)),
      }
    }).sort((a, b) => {
      if (a.type !== b.type) return a.type === 'bolsa' ? -1 : 1
      return a.weight_kg - b.weight_kg
    })
  }, [presentations])

  // Calculate presentation costs
  const getPresentationCost = (type: 'bolsa' | 'pote', weightKg: number, withBrand: boolean) => {
    const productCost = costPerKg * weightKg
    const envaseCost = getEnvaseCost(type, weightKg)
    const etiquetaCost = withBrand ? getEtiquetaCost(productId, weightKg) : 0
    const totalCost = productCost + envaseCost + etiquetaCost
    return {
      productCost,
      envaseCost,
      etiquetaCost,
      totalCost,
    }
  }

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/productos">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader 
          title={product.name}
          description={product.description}
        >
          <StatusBadge 
            status={product.active ? 'activo' : 'inactivo'} 
            type="client" 
            showDot
          />
        </PageHeader>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Formula Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5 text-primary" />
                Formula del Producto
              </CardTitle>
              <CardDescription>
                Ingredientes por kilogramo de producto terminado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formulas.length > 0 ? (
                <div className="space-y-3">
                  {formulas.map((formula) => (
                    <div 
                      key={formula.id} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{formula.insumo?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formula.insumo?.category && (
                              <span className="capitalize">{formula.insumo.category.replace('_', ' ')}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold">
                          {formula.quantity_per_kg < 1 
                            ? `${(formula.quantity_per_kg * 1000).toFixed(0)} g`
                            : `${formula.quantity_per_kg.toFixed(2)} ${UNIT_OF_MEASURE_ABBR[formula.insumo?.unit_of_measure || 'kg']}`
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">por kg</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No hay formula definida para este producto
                </p>
              )}
            </CardContent>
          </Card>

          {/* Presentations Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5 text-primary" />
                Presentaciones
              </CardTitle>
              <CardDescription>
                Catálogo de presentaciones con costos calculados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {groupedPresentations.map((group) => {
                  const costWithBrand = getPresentationCost(group.type, group.weight_kg, true)
                  const costWithoutBrand = getPresentationCost(group.type, group.weight_kg, false)
                  
                  return (
                    <div key={`${group.type}-${group.weight_kg}`} className="space-y-3">
                      <div className="flex items-center gap-2">
                        {group.type === 'bolsa' ? (
                          <Box className="h-4 w-4 text-amber-600" />
                        ) : (
                          <Cylinder className="h-4 w-4 text-blue-600" />
                        )}
                        <span className="font-medium capitalize">{group.type}</span>
                        <Badge variant="outline">{group.weight_kg} kg</Badge>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-2">
                        {/* Con marca */}
                        <div className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              <span className="font-medium">Con marca</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              +Etiqueta
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Producto ({group.weight_kg} kg)</span>
                              <span>{formatCurrencyDecimal(costWithBrand.productCost)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Envase</span>
                              <span>{formatCurrencyDecimal(costWithBrand.envaseCost)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Etiqueta</span>
                              <span>{formatCurrencyDecimal(costWithBrand.etiquetaCost)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-semibold">
                              <span>Costo total</span>
                              <span className="text-primary">{formatCurrency(costWithBrand.totalCost)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Sin marca */}
                        <div className="p-4 border border-border rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-slate-500" />
                              <span className="font-medium">Sin marca</span>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Producto ({group.weight_kg} kg)</span>
                              <span>{formatCurrencyDecimal(costWithoutBrand.productCost)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Envase</span>
                              <span>{formatCurrencyDecimal(costWithoutBrand.envaseCost)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground line-through opacity-50">
                              <span>Etiqueta</span>
                              <span>-</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-semibold">
                              <span>Costo total</span>
                              <span className="text-primary">{formatCurrency(costWithoutBrand.totalCost)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cost Summary */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-primary" />
                Resumen de Costos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Costo por kg</p>
                <p className="text-2xl font-bold text-primary">
                  {costPerKg > 0 ? formatCurrency(costPerKg) : 'N/A'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total ingredientes</span>
                  <span className="font-medium">{formulas.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Presentaciones</span>
                  <span className="font-medium">{presentations.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Con marca</span>
                  <span className="font-medium">{presentations.filter(p => p.with_brand).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sin marca</span>
                  <span className="font-medium">{presentations.filter(p => !p.with_brand).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4 text-muted-foreground" />
                Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Tipo de producto</p>
                <p className="font-medium capitalize">{product.type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estado</p>
                <StatusBadge 
                  status={product.active ? 'activo' : 'inactivo'} 
                  type="client" 
                  size="sm"
                />
              </div>
              {product.notes && (
                <div>
                  <p className="text-muted-foreground">Notas</p>
                  <p className="font-medium">{product.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
