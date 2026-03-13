'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Search, Users, Eye, Edit, Phone, Mail, Building, Package, Scale, ShoppingCart } from 'lucide-react'
import { getClientStatsFromStore, formatCurrency, formatWeight } from '@/lib/mock-data'
import { getAllClients as getStoredClients } from '@/lib/client-store'
import { getAllOrders } from '@/lib/order-store'

export function ClientsContent() {
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  // Get all orders from shared store for stats calculation
  const allOrders = useMemo(() => getAllOrders(), [])

  // Filter clients
  const filteredClients = useMemo(() => {
    return getStoredClients().filter(client => {
      // Active filter
      if (!showInactive && !client.active) return false

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          client.name?.toLowerCase().includes(searchLower) ||
          client.company?.toLowerCase().includes(searchLower) ||
          client.email?.toLowerCase().includes(searchLower) ||
          client.phone?.includes(searchLower)
        )
      }

      return true
    })
  }, [search, showInactive])

  // Count inactive
  const inactiveCount = getStoredClients().filter(c => !c.active).length

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <PageHeader 
        title="Clientes"
        description={`${filteredClients.length} cliente${filteredClients.length !== 1 ? 's' : ''}${showInactive ? ` (${inactiveCount} inactivo${inactiveCount !== 1 ? 's' : ''})` : ''}`}
      >
        <Link href="/clientes/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </Link>
      </PageHeader>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, empresa, email o telefono..."
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
              {showInactive ? 'Ocultar inactivos' : `Mostrar inactivos (${inactiveCount})`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => {
            const stats = getClientStatsFromStore(client.id, allOrders)
            return (
              <Card key={client.id} className="shadow-sm hover:shadow-md transition-all group">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {client.name ? client.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{client.name || 'Sin nombre'}</h3>
                        {client.company && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {client.company}
                          </p>
                        )}
                      </div>
                    </div>
                    <StatusBadge 
                      status={client.active ? 'activo' : 'inactivo'} 
                      type="client" 
                      size="sm"
                      showDot
                    />
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

                  {/* Client Stats */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-border mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <ShoppingCart className="h-3 w-3" />
                      </div>
                      <p className="text-sm font-semibold">{stats.totalOrders}</p>
                      <p className="text-xs text-muted-foreground">Pedidos</p>
                    </div>
                    <div className="text-center border-x border-border">
                      <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                        <Package className="h-3 w-3" />
                      </div>
                      <p className="text-sm font-semibold">{formatWeight(stats.enduidoKg)}</p>
                      <p className="text-xs text-muted-foreground">Enduido</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                        <Scale className="h-3 w-3" />
                      </div>
                      <p className="text-sm font-semibold">{formatWeight(stats.masillaKg)}</p>
                      <p className="text-xs text-muted-foreground">Masilla</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total comprado</p>
                      <p className="text-sm font-bold text-primary">{formatCurrency(stats.totalPurchased)}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/clientes/${client.id}`}>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/clientes/${client.id}/editar`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <EmptyState
              icon={Users}
              title="No se encontraron clientes"
              description={search 
                ? "Intenta ajustar la busqueda" 
                : "Crea tu primer cliente para comenzar"
              }
              action={
                search ? (
                  <Button variant="outline" onClick={() => setSearch('')}>
                    Limpiar busqueda
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
