'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Package } from 'lucide-react'
import { FormulaEditor } from './formula-editor'
import { 
  PRODUCTS,
  PRODUCT_FORMULAS,
  calculateProductCostPerKg,
  formatCurrencyDecimal, 
} from '@/lib/mock-data'
import type { ProductFormula } from '@/lib/types'

export function FormulasContent() {
  const [selectedProduct, setSelectedProduct] = useState<string>('all')
  const [editingFormulas, setEditingFormulas] = useState<Record<string, ProductFormula[]>>({})

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

  // Get formulas for display (use edited version if available, otherwise original)
  const getDisplayFormulas = (productId: string) => {
    return editingFormulas[productId] || (groupedFormulas[productId] || [])
  }

  // Handle formula save
  const handleFormulasSave = (productId: string, updatedFormulas: ProductFormula[]) => {
    setEditingFormulas(prev => ({
      ...prev,
      [productId]: updatedFormulas
    }))
  }

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
          description="Composición de ingredientes por kg de producto. Las fórmulas son completamente editables - modifica cantidades, ingredientes, o unidades y los costos se recalculan automáticamente."
        />
      </div>

      {/* Formulas by Product */}
      <div className="space-y-8">
        {Object.entries(groupedFormulas).map(([productId, _]) => {
          const product = PRODUCTS.find(p => p.id === productId)
          if (!product) return null

          const displayFormulas = getDisplayFormulas(productId)
          const costPerKg = calculateProductCostPerKg(productId)

          return (
            <div key={productId} className="space-y-4">
              {/* Product Info Card */}
              <Card className="shadow-sm">
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
              </Card>

              {/* Formula Editor */}
              <FormulaEditor
                productId={productId}
                formulas={displayFormulas}
                onSave={(updated) => handleFormulasSave(productId, updated)}
              />
            </div>
          )
        })}
      </div>

      {Object.keys(groupedFormulas).length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No se encontraron fórmulas</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
