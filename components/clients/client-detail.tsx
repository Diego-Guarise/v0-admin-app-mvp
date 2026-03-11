'use client'

import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  ArrowLeft, 
  Edit,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  ShoppingCart,
  Package,
  Scale
} from 'lucide-react'
import { ORDERS, formatCurrency, formatDate, formatWeight } from '@/lib/mock-data'
import type { Client } from '@/lib/types'

interface ClientDetailProps {
  client: Client
}

export function ClientDetail({ client }: ClientDetailProps) {
  // Get client's orders
  const clientOrders = ORDERS.filter(o => o.client_id === client.id)
  
  // Calculate client stats
  const totalOrders = clientOrders.length
  const totalSpent = clientOrders.reduce((acc, o) => acc + o.total, 0)
  const totalEnduido = clientOrders.reduce((acc, o) => acc + o.enduido_kg, 0)
  const totalMasilla = clientOrders.reduce((acc, o) => acc + o.masilla_kg, 0)

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <PageHeader 
        title={client.name}
        description={client.company || 'Cliente'}
      >
        <Link href="/clientes">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <Link href={`/clientes/${client.id}/editar`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client Info */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Información de contacto</span>
                <Badge variant={client.active ? 'default' : 'secondary'}>
                  {client.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-primary">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-lg">{client.name}</p>
                  {client.company && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {client.company}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                {client.phone && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Teléfono</p>
                      <p className="text-sm font-medium">{client.phone}</p>
                    </div>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{client.email}</p>
                    </div>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Dirección</p>
                      <p className="text-sm font-medium">{client.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Cliente desde:</span>
                  <span className="font-medium">{formatDate(client.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pedidos</p>
                    <p className="text-xl font-bold">{totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <span className="font-bold text-emerald-600">$</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total comprado</p>
                    <p className="text-lg font-bold">{formatCurrency(totalSpent)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Package className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Enduido</p>
                    <p className="text-lg font-bold">{formatWeight(totalEnduido)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Masilla</p>
                    <p className="text-lg font-bold">{formatWeight(totalMasilla)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Historial de pedidos</CardTitle>
              <Link href={`/pedidos?client=${client.id}`}>
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {clientOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Cobro</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientOrders.slice(0, 5).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium text-primary">
                          {order.order_number}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(order.order_date)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} type="order" size="sm" />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.payment_status} type="payment" size="sm" />
                        </TableCell>
                        <TableCell>
                          <Link href={`/pedidos/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              Ver
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Este cliente aún no tiene pedidos</p>
                  <Link href="/pedidos/nuevo">
                    <Button variant="outline" size="sm" className="mt-4">
                      Crear primer pedido
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
