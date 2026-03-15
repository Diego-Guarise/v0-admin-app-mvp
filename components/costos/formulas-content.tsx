'use client'

import { useState, useMemo, useEffect } from 'react'
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
import { getPersistedFormulas, saveFormulas } from '@/lib/formula-storage'

export function FormulasContent() {
  const [selectedProduct, setSelectedProduct] = useState<string>('all')
  const [editingFormulas, setEditingFormulas] = useState<Record<string, ProductFormula[]>>({})
  const [isHydrated, setIsHydrated] = useState(false)

  // Load persisted formulas on mount (client-side only)
  useEffect(() => {
    const loadFormulas = () => {
      const persistedFormulas: Record<string, ProductFormula[]> = {}
      
      for (const product of PRODUCTS) {
        const formulas = getPersistedFormulas(product.id)
        if (formulas) {
          // Use persisted formulas if they exist
          persistedFormulas[product.id] = formulas
        } else {
          // Fall back to mock data initially
          const mockFormulas = PRODUCT_FORMULAS.filter(f => f.product_id === product.id && f.active)
          if (mockFormulas.length > 0) {
            persistedFormulas[product.id] = mockFormulas
          }
        }
      }
      
      setEditingFormulas(persistedFormulas)
      setIsHydrated(true)
    }
    
    loadFormulas()
  }, [])

  // Filter formulas by product
  const filteredFormulas = useMemo(() => {
    if (selectedProduct === 'all') {
      return Object.values(editingFormulas).flat()
    }
    return editingFormulas[selectedProduct] || []
  }, [selectedProduct, editingFormulas])

  // Group formulas by product
  const groupedFormulas = useMemo(() => {
    const groups: Record<string, ProductFormula[]> = {}
    filteredFormulas.forEach(formula => {
      if (!groups[formula.product_id]) {
        groups[formula.product_id] = []
      }
      groups[formula.product_id].push(formula)
    })
    return groups
  }, [filteredFormulas])

  // Get formulas for display
  const getDisplayFormulas = (productId: string) => {
    return editingFormulas[productId] || []
  }

  // Handle formula save - persist changes to localStorage
  const handleFormulasSave = (productId: string, updatedFormulas: ProductFormula[]) => {
    // Update local state
    setEditingFormulas(prev => ({
      ...prev,
      [productId]: updatedFormulas
    }))
    
    // Persist to localStorage
    saveFormulas(productId, updatedFormulas)
  }

  // Show loading state until hydrated
  if (!isHydrated) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-muted rounded-lg" />
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    )
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
          // Calculate cost using display formulas (which might be edited), not just global data
          const costPerKg = calculateProductCostPerKg(productId, displayFormulas)

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
