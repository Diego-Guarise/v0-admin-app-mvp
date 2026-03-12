'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Package,
  Beaker,
  DollarSign,
  FileText,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Box,
  Cylinder,
  Tag,
  Scale,
  ArrowUpRight
} from 'lucide-react'
import { 
  PRODUCTS,
  PRESENTATIONS,
  INGREDIENT_INPUTS,
  INGREDIENT_COSTS,
  calculateProductCostPerKg,
  getEnvaseCost,
  getEtiquetaCost,
  formatCurrency,
  formatCurrencyDecimal,
  formatPercent
} from '@/lib/mock-data'
import { calculateProfitMargins } from '@/lib/types'

// Sample selling prices for profit calculation (would come from price list in production)
const SAMPLE_PRICES: Record<string, Record<number, number>> = {
  'prod-1': { // Enduido
    1: 45,
    2: 85,
    5: 195,
    10: 380,
    20: 720,
    1.7: 75,
    7: 290,
    18: 680,
  },
  'prod-2': { // Masilla
    1: 50,
    2: 95,
    5: 220,
    10: 420,
    20: 800,
    1.7: 85,
    7: 320,
    18: 750,
  },
}

export function CostosDashboard() {
  // Calculate stats
  const stats = useMemo(() => {
    const activeInsumos = INGREDIENT_INPUTS.filter(i => i.status === 'activo').length
    const totalCostRecords = INGREDIENT_COSTS.length
    const totalPurchases = INGREDIENT_COSTS.reduce((sum, c) => sum + c.total_amount, 0)
    const totalIVA = INGREDIENT_COSTS.reduce((sum, c) => sum + c.iva, 0)
    
    return {
      activeInsumos,
      totalCostRecords,
      totalPurchases,
      totalIVA,
    }
  }, [])

  // Calculate product costs
  const productCosts = useMemo(() => {
    return PRODUCTS.filter(p => p.active).map(product => {
      const costPerKg = calculateProductCostPerKg(product.id)
      return {
        product,
        costPerKg,
      }
    })
  }, [])

  // Calculate presentation costs with margins
  const presentationCosts = useMemo(() => {
    const costs: Array<{
      product: typeof PRODUCTS[0]
      type: 'bolsa' | 'pote'
      weight_kg: number
      with_brand: boolean
      cost: number
      sellingPrice: number
      marginOverPrice: number
      markupOverCost: number
    }> = []

    PRODUCTS.filter(p => p.active).forEach(product => {
      const costPerKg = calculateProductCostPerKg(product.id)
      const prices = SAMPLE_PRICES[product.id] || {}

      // Get unique weight/type combinations
      const combinations = new Set<string>()
      PRESENTATIONS.filter(p => p.product_id === product.id && p.active).forEach(pres => {
        combinations.add(`${pres.type}-${pres.weight_kg}`)
      })

      combinations.forEach(combo => {
        const [type, weightStr] = combo.split('-')
        const weight = parseFloat(weightStr)
        
        ;[true, false].forEach(withBrand => {
          const productCost = costPerKg * weight
          const envaseCost = getEnvaseCost(type as 'bolsa' | 'pote', weight)
          const etiquetaCost = withBrand ? getEtiquetaCost(product.id, weight) : 0
          const totalCost = productCost + envaseCost + etiquetaCost
          const sellingPrice = prices[weight] || 0
          
          const margins = sellingPrice > 0 
            ? calculateProfitMargins(sellingPrice, totalCost)
            : { margin_over_price: 0, markup_over_cost: 0 }

          costs.push({
            product,
            type: type as 'bolsa' | 'pote',
            weight_kg: weight,
            with_brand: withBrand,
            cost: totalCost,
            sellingPrice,
            marginOverPrice: margins.margin_over_price,
            markupOverCost: margins.markup_over_cost,
          })
        })
      })
    })

    return costs.sort((a, b) => {
      if (a.product.id !== b.product.id) return a.product.id.localeCompare(b.product.id)
      if (a.type !== b.type) return a.type === 'bolsa' ? -1 : 1
      if (a.weight_kg !== b.weight_kg) return a.weight_kg - b.weight_kg
      return a.with_brand ? -1 : 1
    })
  }, [])

  // Navigation links
  const navLinks = [
    {
      title: 'Insumos',
      description: 'Catálogo de materias primas, aditivos, envases y etiquetas',
      href: '/costos/insumos',
      icon: Package,
      count: stats.activeInsumos,
    },
    {
      title: 'Registro de Costos',
      description: 'Historial de compras con desglose de IVA',
      href: '/costos/registros',
      icon: FileText,
      count: stats.totalCostRecords,
    },
    {
      title: 'Fórmulas',
      description: 'Composición de ingredientes por producto',
      href: '/costos/formulas',
      icon: Beaker,
      count: PRODUCTS.filter(p => p.active).length,
    },
  ]

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <PageHeader 
        title="Costos de Producción"
        description="Gestión de insumos, fórmulas y cálculo de costos"
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Insumos activos"
          value={stats.activeInsumos}
          icon={Package}
          variant="default"
        />
        <StatCard
          title="Registros de costo"
          value={stats.totalCostRecords}
          icon={FileText}
          variant="default"
        />
        <StatCard
          title="Total compras"
          value={formatCurrency(stats.totalPurchases)}
          icon={DollarSign}
          variant="primary"
        />
        <StatCard
          title="IVA recuperable"
          value={formatCurrency(stats.totalIVA)}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {navLinks.map(link => (
          <Link key={link.href} href={link.href}>
            <Card className="shadow-sm hover:shadow-md transition-all h-full cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <link.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {link.title}
                        <Badge variant="secondary" className="text-xs">{link.count}</Badge>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{link.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Cost per kg Summary */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Costo por Kilogramo
          </CardTitle>
          <CardDescription>
            Costo calculado de producción por kg de producto terminado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {productCosts.map(({ product, costPerKg }) => (
              <div 
                key={product.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    product.type === 'enduido' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <Badge variant="outline" className="text-xs capitalize mt-0.5">
                      {product.type}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(costPerKg)}
                  </p>
                  <p className="text-xs text-muted-foreground">por kg</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Margin Analysis */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Análisis de Márgenes
          </CardTitle>
          <CardDescription>
            Comparación de costos vs precios de venta con márgenes calculados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {PRODUCTS.filter(p => p.active).map(product => {
              const productPresentations = presentationCosts.filter(
                pc => pc.product.id === product.id && pc.with_brand
              )
              
              return (
                <div key={product.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className={`h-4 w-4 ${
                      product.type === 'enduido' ? 'text-blue-600' : 'text-emerald-600'
                    }`} />
                    <h3 className="font-semibold">{product.name}</h3>
                    <Badge variant="outline" className="text-xs">Con marca</Badge>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 font-medium">Presentación</th>
                          <th className="text-right py-2 font-medium">Costo</th>
                          <th className="text-right py-2 font-medium">Precio</th>
                          <th className="text-right py-2 font-medium">
                            <span className="flex items-center justify-end gap-1">
                              Margen s/precio
                              <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                            </span>
                          </th>
                          <th className="text-right py-2 font-medium">
                            <span className="flex items-center justify-end gap-1">
                              Markup s/costo
                              <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {productPresentations.map((pc, idx) => {
                          const MarginIcon = pc.marginOverPrice > 30 
                            ? TrendingUp 
                            : pc.marginOverPrice > 15 
                              ? Minus 
                              : TrendingDown
                          const marginColor = pc.marginOverPrice > 30 
                            ? 'text-emerald-600' 
                            : pc.marginOverPrice > 15 
                              ? 'text-amber-600' 
                              : 'text-red-600'

                          return (
                            <tr key={idx} className="border-b border-border/50 last:border-0">
                              <td className="py-2">
                                <div className="flex items-center gap-2">
                                  {pc.type === 'bolsa' ? (
                                    <Box className="h-4 w-4 text-amber-600" />
                                  ) : (
                                    <Cylinder className="h-4 w-4 text-blue-600" />
                                  )}
                                  <span className="capitalize">{pc.type}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {pc.weight_kg} kg
                                  </Badge>
                                </div>
                              </td>
                              <td className="py-2 text-right font-mono">
                                {formatCurrencyDecimal(pc.cost)}
                              </td>
                              <td className="py-2 text-right font-mono font-semibold">
                                {pc.sellingPrice > 0 
                                  ? formatCurrency(pc.sellingPrice) 
                                  : <span className="text-muted-foreground">-</span>
                                }
                              </td>
                              <td className="py-2 text-right">
                                {pc.sellingPrice > 0 ? (
                                  <div className={`flex items-center justify-end gap-1 ${marginColor}`}>
                                    <MarginIcon className="h-3 w-3" />
                                    <span className="font-semibold">
                                      {formatPercent(pc.marginOverPrice)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="py-2 text-right">
                                {pc.sellingPrice > 0 ? (
                                  <span className={`font-semibold ${marginColor}`}>
                                    {formatPercent(pc.markupOverCost)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <Separator className="my-4" />
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span>{'Margen > 30%'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Minus className="h-3 w-3 text-amber-600" />
              <span>Margen 15-30%</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span>{'Margen < 15%'}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div>
              <strong>Margen s/precio</strong> = (precio - costo) / precio × 100
            </div>
            <div>
              <strong>Markup s/costo</strong> = (precio - costo) / costo × 100
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
