'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Users, Eye, Edit, Phone, Mail, Building } from 'lucide-react'
import { CLIENTS } from '@/lib/mock-data'

export function ClientsContent() {
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  // Filter clients
  const filteredClients = useMemo(() => {
    return CLIENTS.filter(client => {
      // Active filter
      if (!showInactive && !client.active) return false

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          client.name.toLowerCase().includes(searchLower) ||
          client.company?.toLowerCase().includes(searchLower) ||
          client.email?.toLowerCase().includes(searchLower) ||
          client.phone?.includes(searchLower)
        )
      }

      return true
    })
  }, [search, showInactive])

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <PageHeader 
        title="Clientes"
        description={`${filteredClients.length} cliente${filteredClients.length !== 1 ? 's' : ''}`}
      >
        <Link href="/clientes/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </Link>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, empresa, email o teléfono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Show inactive toggle */}
            <Button 
              variant={showInactive ? 'secondary' : 'outline'}
              onClick={() => setShowInactive(!showInactive)}
            >
              {showInactive ? 'Ocultar inactivos' : 'Mostrar inactivos'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{client.name}</h3>
                      {client.company && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {client.company}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={client.active ? 'default' : 'secondary'}>
                    {client.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Link href={`/clientes/${client.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver ficha
                    </Button>
                  </Link>
                  <Link href={`/clientes/${client.id}/editar`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Users}
              title="No se encontraron clientes"
              description={search 
                ? "Intenta ajustar la búsqueda" 
                : "Crea tu primer cliente para comenzar"
              }
              action={
                search ? (
                  <Button variant="outline" onClick={() => setSearch('')}>
                    Limpiar búsqueda
                  </Button>
                ) : (
                  <Link href="/clientes/nuevo">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Cliente
                    </Button>
                  </Link>
                )
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
