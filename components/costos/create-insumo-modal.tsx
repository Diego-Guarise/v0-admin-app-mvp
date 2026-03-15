'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { INGREDIENT_CATEGORY_LABELS, type IngredientCategory, type UnitOfMeasure } from '@/lib/types'
import type { IngredientInput, IngredientCost } from '@/lib/types'

interface CreateInsumoModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateInsumo: (insumo: IngredientInput, cost: Omit<IngredientCost, 'id' | 'created_at'>) => void
}

export function CreateInsumoModal({ isOpen, onClose, onCreateInsumo }: CreateInsumoModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<IngredientCategory>('aditivo')
  const [unitOfMeasure, setUnitOfMeasure] = useState<UnitOfMeasure>('kg')
  const [price, setPrice] = useState('')
  const [priceUnit, setPriceUnit] = useState<UnitOfMeasure>('kg')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !price.trim()) {
      alert('Por favor completa todos los campos')
      return
    }

    setIsSubmitting(true)

    try {
      // Generate new IDs
      const insumoId = `ins-${Date.now()}`
      const costId = `ic-${Date.now()}`

      // Create the new ingredient
      const newInsumo: IngredientInput = {
        id: insumoId,
        name: name.trim(),
        category,
        unit_of_measure: unitOfMeasure,
        description: '',
        status: 'activo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Create the initial cost
      const newCost: Omit<IngredientCost, 'id' | 'created_at'> = {
        insumo_id: insumoId,
        insumo: newInsumo,
        date: new Date().toISOString().split('T')[0],
        supplier: 'Ingreso manual',
        quantity: 1,
        unit_of_measure: priceUnit,
        unit_cost_without_iva: Math.round(parseFloat(price) * 100),
        confirmed: true,
        notes: 'Creado desde fórmulas',
      }

      // Call the callback
      onCreateInsumo(newInsumo, newCost)

      // Reset form and close
      setName('')
      setCategory('aditivo')
      setUnitOfMeasure('kg')
      setPrice('')
      setPriceUnit('kg')
      onClose()
    } catch (error) {
      console.error('Error creating insumo:', error)
      alert('Error al crear el insumo')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear nuevo insumo</DialogTitle>
          <DialogDescription>
            Agrega un nuevo ingrediente a tu fórmula de producción
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium mb-1 block">Nombre del insumo *</label>
            <Input
              placeholder="ej: Antihongo, Dispersante"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium mb-1 block">Categoría *</label>
            <Select value={category} onValueChange={(val) => setCategory(val as IngredientCategory)} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INGREDIENT_CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Unit of Use */}
          <div>
            <label className="text-sm font-medium mb-1 block">Unidad de uso *</label>
            <Select value={unitOfMeasure} onValueChange={(val) => setUnitOfMeasure(val as UnitOfMeasure)} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="g">g</SelectItem>
                <SelectItem value="l">L</SelectItem>
                <SelectItem value="ml">ml</SelectItem>
                <SelectItem value="unidad">unidad</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Precio de compra *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="180"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-7"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Price Unit */}
            <div>
              <label className="text-sm font-medium mb-1 block">Unidad del precio *</label>
              <Select value={priceUnit} onValueChange={(val) => setPriceUnit(val as UnitOfMeasure)} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">por kg</SelectItem>
                  <SelectItem value="l">por L</SelectItem>
                  <SelectItem value="unidad">por unidad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Crear insumo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
