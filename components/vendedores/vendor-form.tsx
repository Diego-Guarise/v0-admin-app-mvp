'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { selectIfZero } from '@/lib/utils'
import { ArrowLeft, Save, Briefcase } from 'lucide-react'
import { createVendor, saveVendor } from '@/lib/vendor-store'
import type { Vendor } from '@/lib/types'

interface VendorFormProps {
  vendor?: Vendor
}

export function VendorForm({ vendor }: VendorFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    phone: vendor?.phone || '',
    email: vendor?.email || '',
    commission_percentage: vendor?.commission_percentage || 5,
    notes: vendor?.notes || '',
    active: vendor?.active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (vendor) {
        // Update existing vendor
        saveVendor({
          ...vendor,
          ...formData,
          updated_at: new Date().toISOString(),
        })
      } else {
        // Create new vendor
        createVendor(formData)
      }

      router.push('/vendedores')
    } catch (error) {
      console.error('Error saving vendor:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/vendedores">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader
          title={vendor ? 'Editar Vendedor' : 'Nuevo Vendedor'}
          description={vendor ? `Editando: ${vendor.name}` : 'Crear un nuevo vendedor'}
          icon={Briefcase}
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Vendedor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Juan Perez"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan@example.com"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+34 666 123 456"
              />
            </div>

            {/* Commission */}
            <div className="space-y-2">
              <Label htmlFor="commission">Porcentaje de Comisión (%) *</Label>
              <Input
                id="commission"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.commission_percentage}
                onChange={(e) => setFormData({ ...formData, commission_percentage: parseFloat(e.target.value) })}
                onFocus={selectIfZero}
                placeholder="5"
                required
              />
              <p className="text-xs text-muted-foreground">
                Porcentaje que se calcula sobre el subtotal sin IVA
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observaciones</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales sobre el vendedor..."
                rows={3}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
              <div>
                <Label className="text-base">Vendedor Activo</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.active ? 'Este vendedor puede recibir pedidos' : 'Este vendedor está inactivo'}
                </p>
              </div>
              <Switch
                checked={formData.active}
                onCheckedChange={(active) => setFormData({ ...formData, active })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Guardando...' : 'Guardar Vendedor'}
          </Button>
          <Link href="/vendedores">
            <Button variant="outline">Cancelar</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
