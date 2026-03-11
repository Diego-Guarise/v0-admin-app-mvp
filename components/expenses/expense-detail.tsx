'use client'

import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Edit,
  Calendar,
  Tag,
  Building,
  FileText,
  CreditCard,
  RotateCcw,
  AlertCircle
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/mock-data'
import type { Expense } from '@/lib/types'

interface ExpenseDetailProps {
  expense: Expense
}

export function ExpenseDetail({ expense }: ExpenseDetailProps) {
  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <PageHeader 
        title={expense.concept}
        description={`Registrado el ${formatDate(expense.created_at)}`}
      >
        <Link href="/gastos">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <Link href={`/gastos/${expense.id}/editar`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amount Summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Monto total</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(expense.amount)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Sin IVA</p>
                  <p className="text-2xl font-bold">{formatCurrency(expense.amount_without_iva)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">IVA</p>
                  <p className="text-2xl font-bold text-muted-foreground">
                    {expense.iva > 0 ? formatCurrency(expense.iva) : '-'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalles del gasto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha</p>
                    <p className="font-medium">{formatDate(expense.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mes contable</p>
                    <p className="font-medium">{expense.accounting_month}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Categoría</p>
                    <p className="font-medium">{expense.category.name}</p>
                    {expense.subcategory && (
                      <p className="text-xs text-muted-foreground">{expense.subcategory}</p>
                    )}
                  </div>
                </div>

                {expense.supplier && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Building className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Proveedor</p>
                      <p className="font-medium">{expense.supplier}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Factura:</span>
                  {expense.has_invoice ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      Sí
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                      No
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Tipo:</span>
                  <StatusBadge status={expense.expense_type} type="expenseType" size="sm" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <StatusBadge status={expense.status} type="expense" size="sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info (for deferred payments) */}
          {expense.expense_type === 'diferido' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Información de pago diferido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {expense.due_date && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">Fecha de vencimiento</p>
                      <p className="text-lg font-bold text-orange-900">{formatDate(expense.due_date)}</p>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {expense.payment_method && (
                    <div>
                      <p className="text-xs text-muted-foreground">Medio de pago</p>
                      <p className="font-medium">{expense.payment_method}</p>
                    </div>
                  )}
                  {expense.check_number && (
                    <div>
                      <p className="text-xs text-muted-foreground">Número de cheque</p>
                      <p className="font-medium">{expense.check_number}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recurrence Info */}
          {expense.expense_type === 'recurrente' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Información de recurrencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Frecuencia</p>
                    <p className="font-medium capitalize">{expense.recurrence_frequency}</p>
                  </div>
                  {expense.estimated_day && (
                    <div>
                      <p className="text-xs text-muted-foreground">Día estimado</p>
                      <p className="font-medium">Día {expense.estimated_day}</p>
                    </div>
                  )}
                  {expense.estimated_amount && (
                    <div>
                      <p className="text-xs text-muted-foreground">Monto estimado</p>
                      <p className="font-medium">{formatCurrency(expense.estimated_amount)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {expense.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{expense.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-muted-foreground">Monto ingresado</span>
                <span className="font-bold text-lg">{formatCurrency(expense.amount)}</span>
              </div>

              {expense.has_invoice && (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Base imponible</span>
                    <span className="font-medium">{formatCurrency(expense.amount_without_iva)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">IVA (22%)</span>
                    <span className="font-medium">{formatCurrency(expense.iva)}</span>
                  </div>
                </>
              )}

              {!expense.has_invoice && (
                <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
                  Sin factura - No se deduce IVA
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Link href={`/gastos/${expense.id}/editar`} className="block">
                <Button variant="outline" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar gasto
                </Button>
              </Link>
              {expense.status === 'activo' && (
                <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                  Anular gasto
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
