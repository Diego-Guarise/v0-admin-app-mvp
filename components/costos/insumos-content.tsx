'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  Package,
  ArrowLeft,
  Beaker,
  Box,
  Tag,
  Settings
} from 'lucide-react'
import { INGREDIENT_INPUTS, getLatestIngredientCost, formatCurrencyDecimal } from '@/lib/mock-data'
import { INGREDIENT_CATEGORY_LABELS, UNIT_OF_MEASURE_ABBR, type IngredientCategory } from '@/lib/types'

const categoryIcons: Record<IngredientCategory, React.ComponentType<{ className?: string }>> = {
  materia_prima: Beaker,
  aditivo: Beaker,
  envase: Box,
  etiqueta: Tag,
  operativo: Settings,
}

export function InsumosContent() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showInactive, setShowInactive] = useState(false)

  // Filter insumos
  const filteredInsumos = useMemo(() => {
    return INGREDIENT_INPUTS.filter(insumo => {
      // Status filter
      if (!showInactive && insumo.status === 'inactivo') return false
      
      // Category filter
      if (categoryFilter !== 'all' && insumo.category !== categoryFilter) return false

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          insumo.name.toLowerCase().includes(searchLower) ||
          insumo.description?.toLowerCase().includes(searchLower)
        )
      }

      return true
    })
  }, [search, categoryFilter, showInactive])

  // Group by category
  const groupedInsumos = useMemo(() => {
    const groups: Record<string, typeof filteredInsumos> = {}
    filteredInsumos.forEach(insumo => {
      if (!groups[insumo.category]) {
        groups[insumo.category] = []
      }
      groups[insumo.category].push(insumo)
    })
    return groups
  }, [filteredInsumos])

  // Count inactive
  const inactiveCount = INGREDIENT_INPUTS.filter(i => i.status === 'inactivo').length

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
          title="Insumos"
          description={`${filteredInsumos.length} insumo${filteredInsumos.length !== 1 ? 's' : ''} registrado${filteredInsumos.length !== 1 ? 's' : ''}`}
        />
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar insumos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {Object.entries(INGREDIENT_CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Show inactive toggle */}
            {inactiveCount > 0 && (
              <Button 
                variant={showInactive ? 'secondary' : 'outline'}
                onClick={() => setShowInactive(!showInactive)}
              >
                {showInactive ? 'Ocultar inactivos' : `Mostrar inactivos (${inactiveCount})`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insumos List */}
      {Object.keys(groupedInsumos).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedInsumos).map(([category, insumos]) => {
            const CategoryIcon = categoryIcons[category as IngredientCategory] || Package
            
            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <CategoryIcon className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">
                    {INGREDIENT_CATEGORY_LABELS[category as IngredientCategory]}
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {insumos.length}
                  </Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {insumos.map(insumo => {
                    const latestCost = getLatestIngredientCost(insumo.id)
                    
                    return (
                      <Card key={insumo.id} className="shadow-sm hover:shadow-md transition-all">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-medium">{insumo.name}</h3>
                              {insumo.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {insumo.description}
                                </p>
                              )}
                            </div>
                            <StatusBadge 
                              status={insumo.status} 
                              type="client" 
                              size="sm"
                            />
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {UNIT_OF_MEASURE_ABBR[insumo.unit_of_measure]}
                              </Badge>
                            </div>
                            <div className="text-right">
                              {latestCost ? (
                                <>
                                  <p className="text-sm font-semibold text-primary">
                                    {formatCurrencyDecimal(latestCost.unit_cost_without_iva)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    por {UNIT_OF_MEASURE_ABBR[insumo.unit_of_measure]}
                                  </p>
                                </>
                              ) : (
                                <p className="text-xs text-muted-foreground">Sin registro</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No se encontraron insumos</p>
            {search && (
              <Button variant="outline" className="mt-4" onClick={() => setSearch('')}>
                Limpiar búsqueda
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
