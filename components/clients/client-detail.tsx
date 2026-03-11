'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
  Scale,
  FileText,
  UserX,
  UserCheck,
  Plus,
  ArrowRight
} from 'lucide-react'
import { getClientStats, getClientOrders, formatCurrency, formatDate, formatWeight } from '@/lib/mock-data'
import type { Client } from '@/lib/types'

interface ClientDetailProps {
  client: Client
}

export function ClientDetail({ client }: ClientDetailProps) {
  const router = useRouter()
  const stats = getClientStats(client.id)
  const clientOrders = getClientOrders(client.id)

  const handleToggleStatus = () => {
    // In real app, this would call an API to toggle client status
    console.log('[v0] Toggling client status:', client.id, !client.active)
    router.refresh()
  }

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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className={client.active ? 'text-destructive border-destructive/30 hover:bg-destructive/10' : ''}>
              {client.active ? (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Desactivar
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activar
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {client.active ? 'Desactivar cliente' : 'Activar cliente'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {client.active 
                  ? 'El cliente sera marcado como inactivo y no aparecera en las listas de seleccion. Sus pedidos e historial se mantendran.'
                  : 'El cliente sera reactivado y volvera a aparecer en las listas de seleccion.'
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleToggleStatus}>
                {client.active ? 'Desactivar' : 'Activar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Informacion de contacto</span>
                <StatusBadge 
                  status={client.active ? 'activo' : 'inactivo'} 
                  type="client"
                  showDot
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
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
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Telefono</p>
                      <p className="text-sm font-medium">{client.phone}</p>
                    </div>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium">{client.email}</p>
                    </div>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Direccion</p>
                      <p className="text-sm font-medium">{client.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Cliente desde:</span>
                  <span className="font-medium">{formatDate(client.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.notes ? (
                <p className="text-sm text-muted-foreground leading-relaxed">{client.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Sin observaciones</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Action */}
          <Link href={`/pedidos/nuevo?client=${client.id}`}>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Crear pedido para este cliente
            </Button>
          </Link>
        </div>

        {/* Stats & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Pedidos</p>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total comprado</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalPurchased)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Enduido</p>
                    <p className="text-lg font-bold">{formatWeight(stats.enduidoKg)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Masilla</p>
                    <p className="text-lg font-bold">{formatWeight(stats.masillaKg)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order History */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  Historial de Pedidos
                </CardTitle>
                {clientOrders.length > 0 && (
                  <Link href={`/pedidos?client=${client.id}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                    Ver todos
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {clientOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>#</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Enduido</TableHead>
                      <TableHead className="text-right">Masilla</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cobro</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientOrders.slice(0, 10).map((order) => (
                      <TableRow key={order.id} className="group">
                        <TableCell>
                          <Link href={`/pedidos/${order.id}`} className="font-bold text-primary hover:underline">
                            {order.order_number}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(order.order_date)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatWeight(order.enduido_kg)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatWeight(order.masilla_kg)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} type="order" size="sm" showDot />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.payment_status} type="payment" size="sm" showDot />
                        </TableCell>
                        <TableCell>
                          <Link href={`/pedidos/${order.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground mb-4">Este cliente aun no tiene pedidos</p>
                  <Link href={`/pedidos/nuevo?client=${client.id}`}>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
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
