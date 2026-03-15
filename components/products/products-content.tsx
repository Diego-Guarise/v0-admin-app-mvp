'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Eye, 
  Box, 
  Cylinder, 
  ChevronRight,
  Layers,
  Tag
} from 'lucide-react'
import { PRODUCTS, PRESENTATIONS, calculateProductCostPerKg, formatCurrency, EXPENSES } from '@/lib/mock-data'
import { getExpenses, initializeExpenses } from '@/lib/expenses-store'
import type { Expense } from '@/lib/types'

export function ProductsContent() {
  const [showInactive, setShowInactive] = useState(false)
  const [persistedExpenses, setPersistedExpenses] = useState<Expense[]>([])

  // Load persisted expenses on mount for real-time cost calculations
  useEffect(() => {
    const expenses = getExpenses()
    if (expenses.length > 0) {
      setPersistedExpenses(expenses)
    } else {
      initializeExpenses(EXPENSES)
      setPersistedExpenses(EXPENSES)
    }
  }, [])

  // Filter products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(product => showInactive || product.active)
  }, [showInactive])

  // Get presentations for a product
  const getProductPresentations = (productId: string) => {
    return PRESENTATIONS.filter(p => p.product_id === productId && p.active)
  }

  // Group presentations by type and weight
  const getGroupedPresentations = (productId: string) => {
    const presentations = getProductPresentations(productId)
    const bolsas = new Set(presentations.filter(p => p.type === 'bolsa').map(p => p.weight_kg))
    const potes = new Set(presentations.filter(p => p.type === 'pote').map(p => p.weight_kg))
    return {
      bolsas: Array.from(bolsas).sort((a, b) => a - b),
      potes: Array.from(potes).sort((a, b) => a - b),
    }
  }

  // Count inactive products
  const inactiveCount = PRODUCTS.filter(p => !p.active).length

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <PageHeader 
        title="Productos"
        description={`${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''}${showInactive ? ` (${inactiveCount} inactivo${inactiveCount !== 1 ? 's' : ''})` : ''}`}
      >
        {inactiveCount > 0 && (
          <Button 
            variant={showInactive ? 'secondary' : 'outline'}
            onClick={() => setShowInactive(!showInactive)}
            size="sm"
          >
            {showInactive ? 'Ocultar inactivos' : `Mostrar inactivos (${inactiveCount})`}
          </Button>
        )}
      </PageHeader>

      {/* Products Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredProducts.map((product) => {
          const costPerKg = calculateProductCostPerKg(product.id, undefined, persistedExpenses)
          const grouped = getGroupedPresentations(product.id)
          const totalPresentations = getProductPresentations(product.id).length

          return (
            <Card key={product.id} className="shadow-sm hover:shadow-md transition-all">
              <CardHeader className="pb-2">
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
                      <CardTitle className="text-lg">{product.name}</CardTitle>
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
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.description && (
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                )}

                {/* Cost per kg */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Costo por kg</span>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {costPerKg > 0 ? formatCurrency(costPerKg) : 'Sin calcular'}
                  </span>
                </div>

                {/* Presentations Summary */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span>Presentaciones ({totalPresentations})</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Bolsas */}
                    <div className="p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Box className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium">Bolsas</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {grouped.bolsas.map(weight => (
                          <Badge key={weight} variant="secondary" className="text-xs">
                            {weight} kg
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Potes */}
                    <div className="p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Cylinder className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Potes</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {grouped.potes.map(weight => (
                          <Badge key={weight} variant="secondary" className="text-xs">
                            {weight} kg
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end pt-2 border-t border-border">
                  <Link href={`/productos/${product.id}`}>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Ver detalle
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
