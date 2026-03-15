'use client'

import { useMemo, useState, Fragment, useEffect } from 'react'
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
  ArrowUpRight,
  ChevronDown
} from 'lucide-react'
import { 
  PRODUCTS,
  PRESENTATIONS,
  INGREDIENT_INPUTS,
  INGREDIENT_COSTS,
  calculateProductCostPerKg,
  calculatePresentationCost,
  formatCurrency,
  formatCurrencyDecimal,
  formatPercent
} from '@/lib/mock-data'
import { calculateProfitMargins, PRICE_CATEGORY_LABELS } from '@/lib/types'
import { getPriceByKey } from '@/lib/price-store'
import { getExpenses, initializeExpenses } from '@/lib/expenses-store'
import { EXPENSES } from '@/lib/mock-data'
import type { PriceCategory, Expense } from '@/lib/types'

// Sample selling prices for profit calculation (would come from price list in production)
const SAMPLE_PRICES: Record<string, Record<number, number>> = {}

export function CostosDashboard() {
  const [expandedBreakdowns, setExpandedBreakdowns] = useState<Set<string>>(new Set())
  const [editingCosts, setEditingCosts] = useState<Record<string, { manual: string; bundle: string; envase: string; etiqueta: string }>>({})
  const [selectedBrand, setSelectedBrand] = useState<'con' | 'sin'>('con')
  const [selectedCategory, setSelectedCategory] = useState<PriceCategory>('barraca')
  const [persistedExpenses, setPersistedExpenses] = useState<Expense[]>([])

  // Load persisted expenses on mount for real-time cost calculations
  useEffect(() => {
    const expenses = getExpenses()
    if (expenses.length > 0) {
      setPersistedExpenses(expenses)
    } else {
      // Initialize with defaults
      initializeExpenses(EXPENSES)
      setPersistedExpenses(EXPENSES)
    }
  }, [])

  // Helper: Check if a presentation is sold per bundle (funda)
  const isSoldPerBundle = (product: typeof PRODUCTS[0], presentation: typeof PRESENTATIONS[0]): boolean => {
    // For Enduido Interior and Masilla para Yeso: 1kg and 2kg are sold per funda
    if ((product.id === 'prod-1' || product.id === 'prod-2') && 
        (presentation.weight_kg === 1 || presentation.weight_kg === 2) &&
        presentation.type === 'bolsa') {
      return true
    }
    return false
  }

  // Helper: Get bundle multiplier (how many units in one funda)
  const getBundleMultiplier = (weight_kg: number): number => {
    if (weight_kg === 1) return 20
    if (weight_kg === 2) return 10
    return 1
  }
    const newSet = new Set(expandedBreakdowns)
    if (newSet.has(key)) {
      newSet.delete(key)
    } else {
      newSet.add(key)
    }
    setExpandedBreakdowns(newSet)
  }

  // Update manual extra cost
  const updateManualExtraCost = (key: string, value: string) => {
    setEditingCosts(prev => ({
      ...prev,
      [key]: { ...prev[key] || { manual: '', bundle: '', envase: '', etiqueta: '' }, manual: value }
    }))
  }

  // Update bundle manual extra cost
  const updateBundleExtraCost = (key: string, value: string) => {
    setEditingCosts(prev => ({
      ...prev,
      [key]: { ...prev[key] || { manual: '', bundle: '', envase: '', etiqueta: '' }, bundle: value }
    }))
  }

  // Update envase cost
  const updateEnvaseCost = (key: string, value: string) => {
    setEditingCosts(prev => ({
      ...prev,
      [key]: { ...prev[key] || { manual: '', bundle: '', envase: '', etiqueta: '' }, envase: value }
    }))
  }

  // Update etiqueta cost
  const updateEtiquetaCost = (key: string, value: string) => {
    setEditingCosts(prev => ({
      ...prev,
      [key]: { ...prev[key] || { manual: '', bundle: '', envase: '', etiqueta: '' }, etiqueta: value }
    }))
  }
  // Calculate stats from persisted expenses
  const stats = useMemo(() => {
    const activeInsumos = INGREDIENT_INPUTS.filter(i => i.status === 'activo').length
    // Count productive expenses (compras de insumos)
    const productiveExpenses = persistedExpenses.filter(e => 
      ['cat-1', 'cat-2', 'cat-3'].includes(e.category_id) && e.insumo_id && e.quantity
    )
    const totalCostRecords = productiveExpenses.length
    const totalPurchases = productiveExpenses.reduce((sum, c) => sum + c.amount, 0)
    const totalIVA = productiveExpenses.reduce((sum, c) => sum + c.iva, 0)
    
    return {
      activeInsumos,
      totalCostRecords,
      totalPurchases,
      totalIVA,
    }
  }, [persistedExpenses])

  // Calculate product costs from persisted expenses
  const productCosts = useMemo(() => {
    return PRODUCTS.filter(p => p.active).map(product => {
      const costPerKg = calculateProductCostPerKg(product.id, undefined, persistedExpenses)
      return {
        product,
        costPerKg,
      }
    })
  }, [persistedExpenses])

  // Calculate presentation costs with margins - uses prices from price store
  const presentationCosts = useMemo(() => {
    const costs: Array<{
      product: typeof PRODUCTS[0]
      presentationId: string
      type: 'bolsa' | 'pote'
      weight_kg: number
      with_brand: boolean
      cost: number
      sellingPrice: number
      marginOverPrice: number
      units_per_bundle?: number
      bundle_manual_extra_cost?: number
      manual_extra_cost?: number
      isSoldByBundle: boolean
      breakdown: {
        product_cost_per_kg: number
        product_cost_for_weight: number
        envase_cost: number
        etiqueta_cost: number
        manual_extra_cost?: number
        total_cost: number
      }
    }> = []

    PRODUCTS.filter(p => p.active).forEach(product => {
      // Only get presentations matching the selected brand
      const filteredPresentations = PRESENTATIONS
        .filter(p => p.product_id === product.id && p.active && p.with_brand === (selectedBrand === 'con'))
      
      filteredPresentations.forEach(presentation => {
          // Use the helper that properly calculates costs from persisted expenses
          const costBreakdown = calculatePresentationCost(presentation, product.id, persistedExpenses)
          
          // Get price from price store based on selected category
          const priceItem = getPriceByKey(
            product.id,
            presentation.id,
            presentation.with_brand,
            selectedCategory
          )
          const sellingPrice = priceItem?.unit_price_for_sales_unit || 0

          // Check if this presentation is sold per bundle (funda)
          const soldByBundle = isSoldPerBundle(product, presentation)
          
          // For bundle presentations, multiply the unit cost by the bundle size
          const displayCost = soldByBundle 
            ? costBreakdown.total_cost * getBundleMultiplier(presentation.weight_kg)
            : costBreakdown.total_cost

          const margins = sellingPrice > 0 
            ? calculateProfitMargins(sellingPrice, displayCost)
            : { margin_over_price: 0, markup_over_cost: 0 }

          costs.push({
            product,
            presentationId: presentation.id,
            type: presentation.type as 'bolsa' | 'pote',
            weight_kg: presentation.weight_kg,
            with_brand: presentation.with_brand,
            cost: displayCost,
            sellingPrice,
            marginOverPrice: margins.margin_over_price,
            units_per_bundle: presentation.units_per_bundle,
            bundle_manual_extra_cost: presentation.bundle_manual_extra_cost,
            manual_extra_cost: presentation.manual_extra_cost,
            isSoldByBundle: soldByBundle,
            breakdown: {
              product_cost_per_kg: costBreakdown.product_cost_per_kg,
              product_cost_for_weight: costBreakdown.product_cost_for_weight,
              envase_cost: costBreakdown.envase_cost,
              etiqueta_cost: costBreakdown.etiqueta_cost,
              manual_extra_cost: presentation.manual_extra_cost,
              total_cost: costBreakdown.total_cost,
            }
          })
        })
    })

    return costs.sort((a, b) => {
      if (a.product.id !== b.product.id) return a.product.id.localeCompare(b.product.id)
      if (a.type !== b.type) return a.type === 'bolsa' ? -1 : 1
      if (a.weight_kg !== b.weight_kg) return a.weight_kg - b.weight_kg
      return a.with_brand ? -1 : 1
    })
  }, [selectedBrand, selectedCategory, persistedExpenses])

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
            {/* Brand and Category Selectors */}
            <div className="space-y-3 pb-4 border-b border-border">
              {/* Brand Selector */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Marca</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedBrand('con')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedBrand === 'con'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Con marca
                  </button>
                  <button
                    onClick={() => setSelectedBrand('sin')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedBrand === 'sin'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Sin marca
                  </button>
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Categoría</label>
                <div className="flex flex-wrap gap-2">
                  {(['barraca', 'distribuidor', 'oferta', 'consumidor_final'] as const).map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === category
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {PRICE_CATEGORY_LABELS[category]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Loop */}
            {PRODUCTS.filter(p => p.active).map(product => {
              const productPresentations = presentationCosts.filter(
                pc => pc.product.id === product.id
              )
              
              return (
                <div key={product.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className={`h-4 w-4 ${
                      product.type === 'enduido' ? 'text-blue-600' : 'text-emerald-600'
                    }`} />
                    <h3 className="font-semibold">{product.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {selectedBrand === 'con' ? 'Con marca' : 'Sin marca'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {PRICE_CATEGORY_LABELS[selectedCategory]}
                    </Badge>
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

                          const breakdownKey = `${product.id}-${pc.type}-${pc.weight_kg}-${pc.with_brand}`
                          const isExpanded = expandedBreakdowns.has(breakdownKey)

                          return (
                            <Fragment key={breakdownKey}>
                              <tr className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                                <td className="py-2">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => toggleBreakdown(breakdownKey)}
                                      className="p-0 hover:bg-muted rounded transition-colors"
                                      title="Ver desglose de costo"
                                    >
                                      <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                    {pc.type === 'bolsa' ? (
                                      <Box className="h-4 w-4 text-amber-600" />
                                    ) : (
                                      <Cylinder className="h-4 w-4 text-blue-600" />
                                    )}
                                    <span className="capitalize">{pc.type}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {pc.weight_kg} kg
                                    </Badge>
                                    {pc.isSoldByBundle && (
                                      <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                        por funda ({getBundleMultiplier(pc.weight_kg)} unidades)
                                      </Badge>
                                    )}
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
                              </tr>
                              {/* Cost Breakdown Row */}
                              {isExpanded && (
                                <tr className="border-b border-border/30 bg-blue-50/40">
                                  <td colSpan={4} className="py-4 px-4">
                                    <div className="space-y-4 ml-6">
                                      <h4 className="font-semibold text-sm text-foreground">Desglose de costo</h4>
                                      
                                      {/* Product base cost */}
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                          Producto base ({formatCurrencyDecimal(pc.breakdown.product_cost_per_kg)}/kg × {pc.weight_kg} kg)
                                        </span>
                                        <span className="font-mono font-medium">
                                          {formatCurrencyDecimal(pc.breakdown.product_cost_for_weight)}
                                        </span>
                                      </div>

                                      {/* Envase cost - EDITABLE */}
                                      {(() => {
                                        const costKey = breakdownKey
                                        const currentEnvaseCost = editingCosts[costKey]?.envase !== undefined 
                                          ? parseFloat(editingCosts[costKey].envase) || 0
                                          : (pc.breakdown.envase_cost ?? 0)
                                        
                                        return (
                                          <div className="flex items-center justify-between text-sm bg-blue-50/50 p-2 rounded border border-blue-100">
                                            <label className="text-muted-foreground">Costo envase</label>
                                            <div className="flex items-center gap-2">
                                              <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={editingCosts[costKey]?.envase ?? (pc.breakdown.envase_cost ?? '')}
                                                onChange={(e) => updateEnvaseCost(costKey, e.target.value)}
                                                className="w-20 px-2 py-1 text-sm text-right font-mono border border-border rounded bg-white"
                                                placeholder="0"
                                              />
                                              <span className="text-muted-foreground text-xs">
                                                {currentEnvaseCost > 0 ? formatCurrencyDecimal(currentEnvaseCost) : '—'}
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      })()}

                                      {/* Etiqueta cost - EDITABLE */}
                                      {(() => {
                                        const costKey = breakdownKey
                                        const currentEtiquetaCost = editingCosts[costKey]?.etiqueta !== undefined 
                                          ? parseFloat(editingCosts[costKey].etiqueta) || 0
                                          : (pc.breakdown.etiqueta_cost ?? 0)
                                        
                                        return (
                                          <div className="flex items-center justify-between text-sm bg-emerald-50/50 p-2 rounded border border-emerald-100">
                                            <label className="text-muted-foreground">Costo etiqueta</label>
                                            <div className="flex items-center gap-2">
                                              <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={editingCosts[costKey]?.etiqueta ?? (pc.breakdown.etiqueta_cost ?? '')}
                                                onChange={(e) => updateEtiquetaCost(costKey, e.target.value)}
                                                className="w-20 px-2 py-1 text-sm text-right font-mono border border-border rounded bg-white"
                                                placeholder="0"
                                              />
                                              <span className="text-muted-foreground text-xs">
                                                {currentEtiquetaCost > 0 ? formatCurrencyDecimal(currentEtiquetaCost) : '—'}
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      })()}

                                      {/* Manual extra cost - EDITABLE */}
                                      {(() => {
                                        const costKey = breakdownKey
                                        const currentManualCost = editingCosts[costKey]?.manual !== undefined 
                                          ? parseFloat(editingCosts[costKey].manual) || 0
                                          : (pc.breakdown.manual_extra_cost ?? 0)
                                        
                                        return (
                                          <div className="flex items-center justify-between text-sm bg-amber-50/50 p-2 rounded border border-amber-100">
                                            <label className="text-muted-foreground">Costo extra manual</label>
                                            <div className="flex items-center gap-2">
                                              <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={editingCosts[costKey]?.manual ?? (pc.breakdown.manual_extra_cost ?? '')}
                                                onChange={(e) => updateManualExtraCost(costKey, e.target.value)}
                                                className="w-20 px-2 py-1 text-sm text-right font-mono border border-border rounded bg-white"
                                                placeholder="0"
                                              />
                                              <span className="text-muted-foreground text-xs">
                                                {currentManualCost > 0 ? formatCurrencyDecimal(currentManualCost) : '—'}
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      })()}

                                      {/* Separator */}
                                      <div className="border-t border-border/50 my-2"></div>

                                      {/* Total per unit */}
                                      <div className="flex items-center justify-between text-sm font-semibold">
                                        <span>Costo total unitario</span>
                                        <span className="font-mono text-primary">
                                          {(() => {
                                            const costKey = breakdownKey
                                            const manualCost = editingCosts[costKey]?.manual !== undefined 
                                              ? parseFloat(editingCosts[costKey].manual) || 0
                                              : (pc.breakdown.manual_extra_cost ?? 0)
                                            const envaseCost = editingCosts[costKey]?.envase !== undefined 
                                              ? parseFloat(editingCosts[costKey].envase) || 0
                                              : (pc.breakdown.envase_cost ?? 0)
                                            const etiquetaCost = editingCosts[costKey]?.etiqueta !== undefined 
                                              ? parseFloat(editingCosts[costKey].etiqueta) || 0
                                              : (pc.breakdown.etiqueta_cost ?? 0)
                                            const totalWithManual = pc.breakdown.product_cost_for_weight + envaseCost + etiquetaCost + manualCost
                                            return formatCurrencyDecimal(totalWithManual)
                                          })()}
                                        </span>
                                      </div>

                                      {/* Bundle cost (only for funda presentations) */}
                                      {pc.isSoldByBundle && (
                                        <div className="bg-amber-50/70 border border-amber-200 rounded p-3">
                                          <div className="flex items-center justify-between text-sm font-semibold">
                                            <span className="text-amber-900">Costo total por funda ({getBundleMultiplier(pc.weight_kg)} unidades)</span>
                                            <span className="font-mono text-amber-700">
                                              {(() => {
                                                const costKey = breakdownKey
                                                const manualCost = editingCosts[costKey]?.manual !== undefined 
                                                  ? parseFloat(editingCosts[costKey].manual) || 0
                                                  : (pc.breakdown.manual_extra_cost ?? 0)
                                                const envaseCost = editingCosts[costKey]?.envase !== undefined 
                                                  ? parseFloat(editingCosts[costKey].envase) || 0
                                                  : (pc.breakdown.envase_cost ?? 0)
                                                const etiquetaCost = editingCosts[costKey]?.etiqueta !== undefined 
                                                  ? parseFloat(editingCosts[costKey].etiqueta) || 0
                                                  : (pc.breakdown.etiqueta_cost ?? 0)
                                                const totalPerUnit = pc.breakdown.product_cost_for_weight + envaseCost + etiquetaCost + manualCost
                                                const bundleTotal = totalPerUnit * getBundleMultiplier(pc.weight_kg)
                                                return formatCurrencyDecimal(bundleTotal)
                                              })()}
                                            </span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Bundle information */}
                                      {pc.units_per_bundle && pc.units_per_bundle > 1 && (
                                        <>
                                          <div className="border-t border-border/30 my-3 pt-3">
                                            <h5 className="font-semibold text-sm text-foreground mb-2">Información de funda</h5>
                                            
                                            {/* Bundle size */}
                                            <div className="flex items-center justify-between text-sm">
                                              <span className="text-muted-foreground">Funda: {pc.units_per_bundle} unidades</span>
                                              <span className="text-muted-foreground">—</span>
                                            </div>

                                            {/* Bundle base cost */}
                                            <div className="flex items-center justify-between text-sm mt-3">
                                              <span className="text-muted-foreground">
                                                Costo unidades ({formatCurrencyDecimal(pc.breakdown.total_cost)} × {pc.units_per_bundle})
                                              </span>
                                              <span className="font-mono font-medium">
                                                {formatCurrencyDecimal(pc.breakdown.total_cost * pc.units_per_bundle)}
                                              </span>
                                            </div>

                                            {/* Bundle extra cost - EDITABLE */}
                                            {(() => {
                                              const costKey = breakdownKey
                                              const currentBundleCost = editingCosts[costKey]?.bundle !== undefined 
                                                ? parseFloat(editingCosts[costKey].bundle) || 0
                                                : (pc.bundle_manual_extra_cost ?? 0)
                                              
                                              return (
                                                <div className="flex items-center justify-between text-sm mt-2 bg-amber-50/50 p-2 rounded border border-amber-100">
                                                  <label className="text-muted-foreground">Costo extra funda</label>
                                                  <div className="flex items-center gap-2">
                                                    <input
                                                      type="number"
                                                      step="0.01"
                                                      min="0"
                                                      value={editingCosts[costKey]?.bundle ?? (pc.bundle_manual_extra_cost ?? '')}
                                                      onChange={(e) => updateBundleExtraCost(costKey, e.target.value)}
                                                      className="w-20 px-2 py-1 text-sm text-right font-mono border border-border rounded bg-white"
                                                      placeholder="0"
                                                    />
                                                    <span className="text-muted-foreground text-xs">
                                                      {currentBundleCost > 0 ? formatCurrencyDecimal(currentBundleCost) : '—'}
                                                    </span>
                                                  </div>
                                                </div>
                                              )
                                            })()}

                                            {/* Separator */}
                                            <div className="border-t border-border/30 my-2"></div>

                                            {/* Total per bundle */}
                                            <div className="flex items-center justify-between text-sm font-semibold">
                                              <span>Costo total por funda</span>
                                              <span className="font-mono text-primary">
                                                {(() => {
                                                  const costKey = breakdownKey
                                                  const manualCost = editingCosts[costKey]?.manual !== undefined 
                                                    ? parseFloat(editingCosts[costKey].manual) || 0
                                                    : (pc.breakdown.manual_extra_cost ?? 0)
                                                  const envaseCost = editingCosts[costKey]?.envase !== undefined 
                                                    ? parseFloat(editingCosts[costKey].envase) || 0
                                                    : (pc.breakdown.envase_cost ?? 0)
                                                  const etiquetaCost = editingCosts[costKey]?.etiqueta !== undefined 
                                                    ? parseFloat(editingCosts[costKey].etiqueta) || 0
                                                    : (pc.breakdown.etiqueta_cost ?? 0)
                                                  const bundleCost = editingCosts[costKey]?.bundle !== undefined 
                                                    ? parseFloat(editingCosts[costKey].bundle) || 0
                                                    : (pc.bundle_manual_extra_cost ?? 0)
                                                  const totalWithManual = pc.breakdown.product_cost_for_weight + envaseCost + etiquetaCost + manualCost
                                                  const bundleTotal = (totalWithManual * pc.units_per_bundle) + bundleCost
                                                  return formatCurrencyDecimal(bundleTotal)
                                                })()}
                                              </span>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
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
