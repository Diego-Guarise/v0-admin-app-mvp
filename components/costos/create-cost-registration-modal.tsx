'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, DollarSign, Weight } from 'lucide-react'
import { INGREDIENT_INPUTS, INGREDIENT_COSTS } from '@/lib/mock-data'
import { calculateIngredientCostIVA } from '@/lib/types'
import { UNIT_OF_MEASURE_ABBR, type UnitOfMeasure } from '@/lib/types'
import type { IngredientCost } from '@/lib/types'

interface CreateCostRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateCost: (cost: IngredientCost) => void
}

export function CreateCostRegistrationModal({
  isOpen,
  onClose,
  onCreateCost,
}: CreateCostRegistrationModalProps) {
  const [insumoId, setInsumoId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [provider, setProvider] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState<UnitOfMeasure>('kg')
  const [totalAmount, setTotalAmount] = useState('')
  const [hasInvoice, setHasInvoice] = useState(true)
  const [observation, setObservation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get selected insumo
  const selectedInsumo = INGREDIENT_INPUTS.find(i => i.id === insumoId)

  // Calculate derived fields
  const qty = parseFloat(quantity) || 0
  const amount = parseFloat(totalAmount) || 0
  
  const calculated = qty > 0 && amount > 0 
    ? calculateIngredientCostIVA(amount, hasInvoice, qty)
    : { amount_without_iva: 0, iva: 0, unit_cost_with_iva: 0, unit_cost_without_iva: 0 }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!insumoId || !quantity || !totalAmount || !provider.trim()) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    if (qty <= 0 || amount <= 0) {
      alert('Cantidad y monto deben ser mayores a cero')
      return
    }

    setIsSubmitting(true)

    try {
      const newCost: IngredientCost = {
        id: `ic-${Date.now()}`,
        insumo_id: insumoId,
        insumo: selectedInsumo,
        date,
        provider: provider.trim(),
        quantity: qty,
        unit_of_measure: unit,
        total_amount: amount,
        has_invoice: hasInvoice,
        amount_without_iva: calculated.amount_without_iva,
        iva: calculated.iva,
        unit_cost_with_iva: calculated.unit_cost_with_iva,
        unit_cost_without_iva: calculated.unit_cost_without_iva,
        notes: observation.trim() || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Calculate real unit cost if applicable
      if (selectedInsumo?.purchase_unit_of_measure && selectedInsumo?.quantity_per_purchase_unit && selectedInsumo.quantity_per_purchase_unit > 1) {
        newCost.real_unit_cost_without_iva = calculated.unit_cost_without_iva / selectedInsumo.quantity_per_purchase_unit
        newCost.real_unit_cost_with_iva = calculated.unit_cost_with_iva / selectedInsumo.quantity_per_purchase_unit
      }

      // Add to the global array
      INGREDIENT_COSTS.push(newCost)
      
      onCreateCost(newCost)

      // Reset form
      setInsumoId('')
      setDate(new Date().toISOString().split('T')[0])
      setProvider('')
      setQuantity('')
      setUnit('kg')
      setTotalAmount('')
      setHasInvoice(true)
      setObservation('')
      onClose()
    } catch (error) {
      console.error('Error creating cost:', error)
      alert('Error al crear el registro de costo')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Compatible units for the selected insumo
  const compatibleUnits = selectedInsumo?.unit_of_measure 
    ? [selectedInsumo.unit_of_measure]
    : ['kg', 'g', 'l', 'ml', 'unidad']

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar nueva compra de insumo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Insumo Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Insumo *</label>
            <Select value={insumoId} onValueChange={setInsumoId} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar insumo..." />
              </SelectTrigger>
              <SelectContent>
                {INGREDIENT_INPUTS.filter(i => i.status === 'activo').map(insumo => (
                  <SelectItem key={insumo.id} value={insumo.id}>
                    {insumo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date and Provider */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Fecha *</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Proveedor *</label>
              <Input
                placeholder="ej: Minera del Plata"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Quantity and Unit */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-2 block">Cantidad comprada *</label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="1000"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-10"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Unidad *</label>
              <Select value={unit} onValueChange={(val) => setUnit(val as UnitOfMeasure)} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {compatibleUnits.map(u => (
                    <SelectItem key={u} value={u}>
                      {UNIT_OF_MEASURE_ABBR[u]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Total Amount */}
          <div>
            <label className="text-sm font-medium mb-2 block">Monto total pagado *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="7200"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                disabled={isSubmitting}
                className="pl-10"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Invoice checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="hasInvoice"
              checked={hasInvoice}
              onChange={(e) => setHasInvoice(e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="hasInvoice" className="text-sm">
              Tiene factura (IVA deducible)
            </label>
          </div>

          {/* Observation */}
          <div>
            <label className="text-sm font-medium mb-2 block">Observación (opcional)</label>
            <Input
              placeholder="ej: Bolsones de 25kg, Incremento de precio"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Automatic Calculations Display */}
          {qty > 0 && amount > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <p className="text-xs font-semibold text-blue-900 mb-3">Cálculos automáticos:</p>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal sin IVA:</span>
                    <span className="font-mono font-semibold">${calculated.amount_without_iva.toFixed(2)}</span>
                  </div>
                  {calculated.iva > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IVA (22%):</span>
                      <span className="font-mono font-semibold text-emerald-600">${calculated.iva.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-blue-200 pt-2 flex justify-between">
                    <span className="font-medium">Costo unitario sin IVA:</span>
                    <span className="font-mono font-bold">${calculated.unit_cost_without_iva.toFixed(2)}/{UNIT_OF_MEASURE_ABBR[unit]}</span>
                  </div>
                  {calculated.unit_cost_with_iva > 0 && (
                    <div className="flex justify-between">
                      <span className="font-medium">Costo unitario con IVA:</span>
                      <span className="font-mono font-bold">${calculated.unit_cost_with_iva.toFixed(2)}/{UNIT_OF_MEASURE_ABBR[unit]}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dialog Footer */}
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !insumoId || !quantity || !totalAmount}>
              {isSubmitting ? 'Guardando...' : 'Registrar compra'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
