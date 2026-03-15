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
import type { IngredientInput } from '@/lib/types'

interface CreateInsumoModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateInsumo: (insumo: IngredientInput) => void
}

export function CreateInsumoModal({ isOpen, onClose, onCreateInsumo }: CreateInsumoModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<IngredientCategory>('materia_prima')
  const [unitOfMeasure, setUnitOfMeasure] = useState<UnitOfMeasure>('kg')
  const [observation, setObservation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert('Por favor ingresa el nombre del insumo')
      return
    }

    setIsSubmitting(true)

    try {
      // Create the new ingredient without price
      const insumoId = `ins-${Date.now()}`
      const newInsumo: IngredientInput = {
        id: insumoId,
        name: name.trim(),
        category,
        unit_of_measure: unitOfMeasure,
        description: observation.trim(),
        status: 'activo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Call the callback
      onCreateInsumo(newInsumo)

      // Reset form and close
      setName('')
      setCategory('materia_prima')
      setUnitOfMeasure('kg')
      setObservation('')
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
              placeholder="ej: Carbonato de calcio, Antihongo"
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

          {/* Observation (Optional) */}
          <div>
            <label className="text-sm font-medium mb-1 block">Observación (opcional)</label>
            <Input
              placeholder="ej: Premium, Concentrado"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
            <p className="font-medium mb-1">Nota sobre el costo:</p>
            <p>El precio se registrará cuando ingrese una compra en <strong>Costos → Registro de costos</strong></p>
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
