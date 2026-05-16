'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Plus, Search, Eye, Edit, Archive, Trash2 } from 'lucide-react'
import { getAllVendors, deactivateVendor, deleteVendor, activateVendor } from '@/lib/vendor-store'
import { getAllOrders } from '@/lib/order-store'
import { formatCurrency } from '@/lib/mock-data'

export function VendedoresContent() {
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [vendors, setVendors] = useState<ReturnType<typeof getAllVendors>>([])
  const [orders, setOrders] = useState<ReturnType<typeof getAllOrders>>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load data from localStorage only on client after mount
  useEffect(() => {
    setVendors(getAllVendors())
    setOrders(getAllOrders())
    setIsHydrated(true)
  }, [])

  // Re-read store and update local state after any mutation
  const refreshVendors = () => setVendors(getAllVendors())

  const handleDeactivate = (id: string) => {
    deactivateVendor(id)
    refreshVendors()
  }

  const handleActivate = (id: string) => {
    activateVendor(id)
    refreshVendors()
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Eliminar el vendedor "${name}"? Esta acción no se puede deshacer.`)) return
    deleteVendor(id)
    refreshVendors()
  }

  // Calculate stats for each vendor
  const vendorStats = useMemo(() => {
    return vendors.map(vendor => {
      // Exclude cancelled orders from all counts
      const vendorOrders = orders.filter(o => o.vendor_id === vendor.id && o.status !== 'anulado')
      const cobradosOrders = vendorOrders.filter(o => o.payment_status === 'cobrado')
      const pendingLiquidationOrders = cobradosOrders.filter(o => o.commission_status === 'pendiente_liquidar')
      const liquidatedOrders = cobradosOrders.filter(o => o.commission_status === 'liquidado')

      return {
        vendor,
        totalOrders: vendorOrders.length,
        cobradosOrders: cobradosOrders.length,
        pendingLiquidationOrders: pendingLiquidationOrders.length,
        liquidatedOrders: liquidatedOrders.length,
      }
    })
  }, [vendors, orders])

  const filteredVendors = useMemo(() => {
    return vendorStats.filter(stat => {
      if (!showInactive && !stat.vendor.active) return false
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          stat.vendor.name.toLowerCase().includes(searchLower) ||
          stat.vendor.email?.toLowerCase().includes(searchLower) ||
          stat.vendor.phone?.includes(searchLower)
        )
      }
      return true
    })
  }, [vendorStats, search, showInactive])

  if (!isHydrated) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando vendedores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Vendedores"
          description="Gestiona vendedores y sus comisiones"
          icon={Briefcase}
        />
        <Link href="/vendedores/nuevo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Vendedor
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showInactive ? 'default' : 'outline'}
          onClick={() => setShowInactive(!showInactive)}
        >
          {showInactive ? 'Mostrando inactivos' : 'Solo activos'}
        </Button>
      </div>

      {/* Vendors Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVendors.map(({ vendor, totalOrders, cobradosOrders, pendingLiquidationOrders, liquidatedOrders }) => (
          <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{vendor.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comisión: {vendor.commission_percentage}%
                  </p>
                </div>
                <Badge variant={vendor.active ? 'default' : 'secondary'}>
                  {vendor.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact info */}
              {vendor.email && (
                <p className="text-sm text-muted-foreground truncate">{vendor.email}</p>
              )}
              {vendor.phone && (
                <p className="text-sm text-muted-foreground">{vendor.phone}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Total Pedidos</p>
                  <p className="text-lg font-semibold">{totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cobrados</p>
                  <p className="text-lg font-semibold">{cobradosOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pendiente</p>
                  <p className="text-lg font-semibold text-amber-600">{pendingLiquidationOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Liquidado</p>
                  <p className="text-lg font-semibold text-green-600">{liquidatedOrders}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Link href={`/vendedores/${vendor.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Eye className="h-4 w-4" />
                    Ver
                  </Button>
                </Link>
                <Link href={`/vendedores/${vendor.id}/editar`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                </Link>
                {vendor.active ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeactivate(vendor.id)}
                    title="Desactivar vendedor"
                    className="gap-2"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleActivate(vendor.id)}
                    title="Reactivar vendedor"
                    className="gap-2 text-green-600"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(vendor.id, vendor.name)}
                  title="Eliminar vendedor"
                  className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-muted-foreground">No hay vendedores para mostrar</p>
        </Card>
      )}
    </div>
  )
}
