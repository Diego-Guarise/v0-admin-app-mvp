'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Trash2, Plus, Save, AlertCircle } from 'lucide-react'
import { CreateInsumoModal } from './create-insumo-modal'
import type { ProductFormula } from '@/lib/types'
import type { IngredientInput } from '@/lib/types'
import { 
  PRODUCTS,
  INGREDIENT_INPUTS,
  getFormulableInsumos,
  calculateProductCostPerKg,
  formatCurrencyDecimal,
  getLatestIngredientCost,
  updateProductFormula,
  createNewFormulaRow
} from '@/lib/mock-data'
import { UNIT_OF_MEASURE_ABBR, INGREDIENT_CATEGORY_LABELS, type IngredientCategory, areUnitsCompatible } from '@/lib/types'

interface FormulaEditorProps {
  productId: string
  formulas: ProductFormula[]
  onSave?: (updatedFormulas: ProductFormula[]) => void
}

export function FormulaEditor({ productId, formulas, onSave }: FormulaEditorProps) {
  const product = PRODUCTS.find(p => p.id === productId)
  const [editingFormulas, setEditingFormulas] = useState<ProductFormula[]>(formulas)
  const [isEditing, setIsEditing] = useState(false)
  const [showCreateInsumoModal, setShowCreateInsumoModal] = useState(false)
  const [pendingFormulaRowId, setPendingFormulaRowId] = useState<string | null>(null)
  const [availableInsumos, setAvailableInsumos] = useState<IngredientInput[]>(getFormulableInsumos())

  const costPerKg = useMemo(() => calculateProductCostPerKg(productId), [productId, editingFormulas])

  // Detect duplicate ingredients
  const getDuplicateInsumoIds = () => {
    const insumoIds = editingFormulas.map(f => f.insumo_id)
    return new Set(insumoIds.filter(id => insumoIds.indexOf(id) !== insumoIds.lastIndexOf(id)))
  }

  const duplicateInsumoIds = useMemo(() => getDuplicateInsumoIds(), [editingFormulas])

  const handleAddIngredient = () => {
    if (availableInsumos.length === 0) return
    const newFormula = createNewFormulaRow(productId, availableInsumos[0].id)
    setEditingFormulas([...editingFormulas, newFormula])
  }

  const handleRemoveIngredient = (formulaId: string) => {
    setEditingFormulas(editingFormulas.filter(f => f.id !== formulaId))
  }

  const handleUpdateFormula = (formulaId: string, updates: Partial<ProductFormula>) => {
    setEditingFormulas(editingFormulas.map(f => 
      f.id === formulaId 
        ? { ...f, ...updates, updated_at: new Date().toISOString() }
        : f
    ))
  }

  const handleSave = () => {
    if (onSave) {
      onSave(editingFormulas)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditingFormulas(formulas)
    setIsEditing(false)
  }

  const handleCreateInsumo = (newInsumo: IngredientInput) => {
    // Add the new insumo to available insumos (local state only)
    const updatedInsumos = [...availableInsumos, newInsumo]
    setAvailableInsumos(updatedInsumos)

    // Auto-select the new insumo in the formula row if one was pending
    if (pendingFormulaRowId) {
      handleUpdateFormula(pendingFormulaRowId, {
        insumo_id: newInsumo.id,
        insumo: newInsumo,
        unit_of_measure: newInsumo.unit_of_measure
      })
      setPendingFormulaRowId(null)
    }

    setShowCreateInsumoModal(false)
  }

  if (!product) return null

  return (
    <>
      <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Fórmula de {product.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Composición de ingredientes por kg de producto
            </p>
          </div>
          {!isEditing && (
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
            >
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formula Rows */}
        <div className="space-y-3">
          {editingFormulas.map((formula, idx) => {
            const insumo = formula.insumo || INGREDIENT_INPUTS.find(i => i.id === formula.insumo_id)
            const latestCost = getLatestIngredientCost(formula.insumo_id)
            const unitCost = latestCost?.unit_cost_without_iva || 0
            const unit = formula.unit_of_measure || insumo?.unit_of_measure || 'kg'
            const isDuplicate = duplicateInsumoIds.has(formula.insumo_id)
            const hasZeroQuantity = formula.quantity_per_kg === 0
            const ingredientCostContribution = formula.quantity_per_kg * unitCost

            return (
              <div key={formula.id} className="space-y-2">
                {/* Warning badges */}
                {(isDuplicate || hasZeroQuantity) && (
                  <div className="flex flex-wrap gap-2">
                    {hasZeroQuantity && (
                      <div className="flex items-center gap-1.5 px-2 py-1 text-xs bg-amber-50 border border-amber-200 rounded text-amber-700">
                        <AlertCircle className="h-3 w-3" />
                        Cantidad en 0
                      </div>
                    )}
                    {isDuplicate && (
                      <div className="flex items-center gap-1.5 px-2 py-1 text-xs bg-blue-50 border border-blue-200 rounded text-blue-700">
                        <AlertCircle className="h-3 w-3" />
                        Este ingrediente ya está en la fórmula
                      </div>
                    )}
                  </div>
                )}

                {/* Main ingredient row */}
                <div className={`flex items-end gap-3 p-4 rounded-lg group ${isDuplicate || hasZeroQuantity ? 'bg-amber-50/40 border border-amber-100/50' : 'bg-muted/50'}`}>
                  {isEditing ? (
                    <>
                      {/* Insumo Select */}
                      <div className="flex-1 min-w-[250px]">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Insumo
                        </label>
                        <Select value={formula.insumo_id} onValueChange={(val) => {
                          if (val === '__create_new__') {
                            setPendingFormulaRowId(formula.id)
                            setShowCreateInsumoModal(true)
                          } else {
                            const selectedInsumo = availableInsumos.find(i => i.id === val)
                            handleUpdateFormula(formula.id, { 
                              insumo_id: val,
                              insumo: selectedInsumo,
                              unit_of_measure: selectedInsumo?.unit_of_measure
                            })
                          }
                        }}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableInsumos.map(insumo => (
                              <SelectItem key={insumo.id} value={insumo.id}>
                                {insumo.name}
                              </SelectItem>
                            ))}
                            <Separator className="my-2" />
                            <SelectItem value="__create_new__" className="text-primary font-medium">
                              + Crear nuevo insumo
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quantity Input */}
                      <div className="w-32">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Cantidad
                        </label>
                        <Input 
                          type="number"
                          min="0"
                          step="0.001"
                          value={formula.quantity_per_kg}
                          onChange={(e) => handleUpdateFormula(formula.id, {
                            quantity_per_kg: parseFloat(e.target.value) || 0
                          })}
                          className="h-9"
                        />
                      </div>

                      {/* Unit Select */}
                      <div className="w-24">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Unidad
                        </label>
                        <Select value={unit} onValueChange={(val) => {
                          handleUpdateFormula(formula.id, { unit_of_measure: val as any })
                        }}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="l">L</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="unidad">un</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Observation field */}
                      <div className="w-32">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Observación
                        </label>
                        <Input 
                          type="text"
                          placeholder="ej: espesante"
                          value={formula.notes || ''}
                          onChange={(e) => handleUpdateFormula(formula.id, {
                            notes: e.target.value
                          })}
                          className="h-9 text-xs"
                        />
                      </div>

                      {/* Delete Button */}
                      <Button
                        onClick={() => handleRemoveIngredient(formula.id)}
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Display Mode */}
                      <div className="flex-1 min-w-[280px]">
                        <p className="font-medium">{insumo?.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {insumo?.category && INGREDIENT_CATEGORY_LABELS[insumo.category as IngredientCategory]}
                          </Badge>
                          {formula.notes && (
                            <Badge variant="secondary" className="text-xs">
                              {formula.notes}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Quantity and Unit */}
                      <div className="text-right min-w-[90px]">
                        <p className="text-sm font-mono font-semibold">
                          {formula.quantity_per_kg.toFixed(formula.quantity_per_kg < 1 ? 3 : 2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {UNIT_OF_MEASURE_ABBR[unit]} por kg
                        </p>
                      </div>

                      {/* Ingredient unit cost */}
                      <div className="text-right min-w-[100px]">
                        <p className="text-xs text-muted-foreground mb-1">Costo insumo</p>
                        <p className="text-sm font-mono font-semibold">
                          {formatCurrencyDecimal(unitCost)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          /{UNIT_OF_MEASURE_ABBR[unit]}
                        </p>
                      </div>

                      <Separator orientation="vertical" className="h-10" />

                      {/* Cost contribution */}
                      <div className="text-right min-w-[110px]">
                        <p className="text-xs text-muted-foreground mb-1 font-medium">Aporte al costo</p>
                        <p className="text-sm font-mono font-bold text-primary">
                          {formatCurrencyDecimal(ingredientCostContribution)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {((ingredientCostContribution / costPerKg) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Ingredient Button - Only in Edit Mode */}
        {isEditing && (
          <Button
            onClick={handleAddIngredient}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar ingrediente
          </Button>
        )}

        {/* Total Cost */}
        <div className="mt-6 pt-6 border-t-2 border-border">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-6 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-2">Resultado final</p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-semibold">Costo total por kg</span>
              <span className="text-4xl font-bold text-primary">
                {formatCurrencyDecimal(costPerKg)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Calculado a partir de {editingFormulas.length} ingrediente{editingFormulas.length !== 1 ? 's' : ''} activo{editingFormulas.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Save/Cancel Buttons - Only in Edit Mode */}
        {isEditing && (
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </Button>
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>

      {/* Create Insumo Modal */}
      <CreateInsumoModal
        isOpen={showCreateInsumoModal}
        onClose={() => {
          setShowCreateInsumoModal(false)
          setPendingFormulaRowId(null)
        }}
        onCreateInsumo={handleCreateInsumo}
      />
    </>
  )
}
