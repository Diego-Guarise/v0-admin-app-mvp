'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, User, Phone, Mail, MapPin, Building, FileText } from 'lucide-react'
import { saveClient } from '@/lib/client-store'
import type { Client } from '@/lib/types'

interface ClientFormProps {
  client?: Client
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter()
  const isEditing = !!client

  // Form state
  const [name, setName] = useState(client?.name || '')
  const [rut, setRut] = useState(client?.rut || '')
  const [company, setCompany] = useState(client?.company || '')
  const [phone, setPhone] = useState(client?.phone || '')
  const [email, setEmail] = useState(client?.email || '')
  const [address, setAddress] = useState(client?.address || '')
  const [notes, setNotes] = useState(client?.notes || '')
  const [active, setActive] = useState(client?.active ?? true)

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newClient: Client = {
      id: isEditing ? client!.id : `client-${Date.now()}`,
      name: name || undefined,
      rut: rut || undefined,
      company: company || undefined,
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
      notes: notes || undefined,
      active,
      created_at: isEditing ? client!.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    saveClient(newClient)
    router.push('/clientes')
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 lg:px-6 py-6 space-y-6">
      <PageHeader 
        title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
        description={isEditing ? 'Modificar datos del cliente' : 'Completa los datos del nuevo cliente'}
      >
        <Link href={isEditing ? `/clientes/${client.id}` : '/clientes'}>
          <Button type="button" variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </Link>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Guardar cambios' : 'Crear cliente'}
        </Button>
      </PageHeader>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Información básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="name">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Nombre (opcional)
                  </span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Pérez"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rut">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    RUT (opcional)
                  </span>
                </Label>
                <Input
                  id="rut"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  placeholder="12.345.678-K"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    Empresa (opcional)
                  </span>
                </Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Nombre de la empresa"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Teléfono
                  </span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="099 123 456"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Dirección
                </span>
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle 123, Ciudad"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas internas sobre el cliente..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active" className="text-base font-medium">
                  Cliente activo
                </Label>
                <p className="text-sm text-muted-foreground">
                  Los clientes inactivos no aparecen en las listas por defecto
                </p>
              </div>
              <Switch
                id="active"
                checked={active}
                onCheckedChange={setActive}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
