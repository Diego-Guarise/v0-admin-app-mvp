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
import { Trash2, Plus, Save } from 'lucide-react'
import type { ProductFormula } from '@/lib/types'
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
  const formaulableInsumos = getFormulableInsumos()

  const costPerKg = useMemo(() => calculateProductCostPerKg(productId), [productId, editingFormulas])

  const handleAddIngredient = () => {
    if (formaulableInsumos.length === 0) return
    const newFormula = createNewFormulaRow(productId, formaulableInsumos[0].id)
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

  if (!product) return null

  return (
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

            return (
              <div key={formula.id} className="flex items-end gap-3 p-3 bg-muted/50 rounded-lg group">
                {isEditing ? (
                  <>
                    {/* Insumo Select */}
                    <div className="flex-1 min-w-[250px]">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Insumo
                      </label>
                      <Select value={formula.insumo_id} onValueChange={(val) => {
                        const selectedInsumo = formaulableInsumos.find(i => i.id === val)
                        handleUpdateFormula(formula.id, { 
                          insumo_id: val,
                          insumo: selectedInsumo,
                          unit_of_measure: selectedInsumo?.unit_of_measure
                        })
                      }}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {formaulableInsumos.map(insumo => (
                            <SelectItem key={insumo.id} value={insumo.id}>
                              {insumo.name}
                            </SelectItem>
                          ))}
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
                    <div className="flex-1 min-w-[250px]">
                      <p className="font-medium">{insumo?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {insumo?.category && INGREDIENT_CATEGORY_LABELS[insumo.category as IngredientCategory]}
                        </Badge>
                        {formula.notes && (
                          <span className="text-xs text-muted-foreground italic">{formula.notes}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-mono font-semibold">
                        {formula.quantity_per_kg.toFixed(formula.quantity_per_kg < 1 ? 3 : 2)} {UNIT_OF_MEASURE_ABBR[unit]}
                      </p>
                      <p className="text-xs text-muted-foreground">por kg</p>
                    </div>

                    <Separator orientation="vertical" className="h-8" />

                    <div className="text-right min-w-[80px]">
                      <p className="text-sm font-mono font-semibold text-primary">
                        {formatCurrencyDecimal(formula.quantity_per_kg * unitCost)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ({formatCurrencyDecimal(unitCost)}/{UNIT_OF_MEASURE_ABBR[unit]})
                      </p>
                    </div>
                  </>
                )}
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
        <div className="flex items-center justify-between pt-4 border-t border-border bg-primary/5 p-3 rounded-lg">
          <span className="font-semibold">Costo total por kg</span>
          <span className="text-xl font-bold text-primary">
            {formatCurrencyDecimal(costPerKg)}
          </span>
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
  )
}
