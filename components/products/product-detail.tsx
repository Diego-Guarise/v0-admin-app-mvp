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
  CheckCircle2,
  XCircle,
  DollarSign,
  Info,
  ExternalLink
} from 'lucide-react'
import { 
  PRODUCTS, 
  PRESENTATIONS, 
  PRODUCT_FORMULAS,
  calculateProductCostPerKg,
  calculatePresentationCost,
  formatCurrency,
  formatCurrencyDecimal,
} from '@/lib/mock-data'

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

  // Get formula count for info display
  const formulaCount = useMemo(() => {
    return PRODUCT_FORMULAS.filter(f => f.product_id === productId && f.active).length
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
        {/* Main Info - Presentations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Presentations Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5 text-primary" />
                Presentaciones
              </CardTitle>
              <CardDescription>
                Catálogo de presentaciones con costos calculados. 
                {product.type === 'enduido' && ' Enduido Interior solo se vende en bolsas.'}
                {product.type === 'masilla' && ' Masilla para Yeso disponible en bolsas y potes.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {groupedPresentations.map((group) => {
                  // Find actual presentation objects for cost calculation
                  const presWithBrand = presentations.find(
                    p => p.type === group.type && p.weight_kg === group.weight_kg && p.with_brand
                  )
                  const presWithoutBrand = presentations.find(
                    p => p.type === group.type && p.weight_kg === group.weight_kg && !p.with_brand
                  )
                  
                  // Calculate costs using the new helper
                  const costWithBrand = presWithBrand 
                    ? calculatePresentationCost(presWithBrand, productId) 
                    : null
                  const costWithoutBrand = presWithoutBrand 
                    ? calculatePresentationCost(presWithoutBrand, productId)
                    : null
                  
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
                        {costWithBrand && (
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
                                <span>{formatCurrencyDecimal(costWithBrand.product_cost_for_weight)}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Envase</span>
                                <span>{formatCurrencyDecimal(costWithBrand.envase_cost)}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Etiqueta</span>
                                <span>{formatCurrencyDecimal(costWithBrand.etiqueta_cost)}</span>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between font-semibold">
                                <span>Costo total</span>
                                <span className="text-primary">{formatCurrency(costWithBrand.total_cost)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Sin marca */}
                        {costWithoutBrand && (
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
                                <span>{formatCurrencyDecimal(costWithoutBrand.product_cost_for_weight)}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Envase</span>
                                <span>{formatCurrencyDecimal(costWithoutBrand.envase_cost)}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground line-through opacity-50">
                                <span>Etiqueta</span>
                                <span>-</span>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between font-semibold">
                                <span>Costo total</span>
                                <span className="text-primary">{formatCurrency(costWithoutBrand.total_cost)}</span>
                              </div>
                            </div>
                          </div>
                        )}
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
                <p className="text-xs text-muted-foreground mt-1">
                  Basado en {formulaCount} ingredientes
                </p>
              </div>

              <div className="space-y-2">
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

              <Separator />

              {/* Link to formulas in Costos module */}
              <div className="pt-2 space-y-2">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                  <p className="text-amber-900 font-medium">💡 Las fórmulas son editables</p>
                  <p className="text-amber-800 mt-1">Modifica ingredientes, cantidades y unidades en Costos → Fórmulas. Los costos se recalculan automáticamente.</p>
                </div>
                <Link href="/costos/formulas">
                  <Button variant="outline" size="sm" className="w-full">
                    <Package className="h-4 w-4 mr-2" />
                    Editar fórmula en Costos
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                </Link>
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
                <p className="text-muted-foreground">Envases disponibles</p>
                <p className="font-medium">
                  {product.type === 'enduido' ? 'Solo bolsas' : 'Bolsas y potes'}
                </p>
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
