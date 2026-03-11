'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
  Calendar,
  Tag,
  Building,
  FileText,
  CreditCard,
  RotateCcw,
  AlertCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Receipt,
  Percent
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/mock-data'
import { RECURRENCE_FREQUENCY_LABELS } from '@/lib/types'
import type { Expense } from '@/lib/types'

interface ExpenseDetailProps {
  expense: Expense
}

export function ExpenseDetail({ expense }: ExpenseDetailProps) {
  const router = useRouter()

  const handleCancel = () => {
    // In real app, this would call an API to cancel the expense
    console.log('[v0] Canceling expense:', expense.id)
    router.push('/gastos')
  }

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
        {expense.status !== 'anulado' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                <XCircle className="h-4 w-4 mr-2" />
                Anular
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Anular Gasto
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta accion marcara el gasto como anulado. El registro no se eliminara y podra consultarse en el historial.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Si, anular gasto
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
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
          {/* IVA Summary - Improved visibility */}
          <Card className="shadow-sm border-2 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="grid gap-6 sm:grid-cols-4">
                <div className="text-center sm:border-r sm:border-primary/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Monto ingresado</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(expense.amount)}</p>
                </div>
                <div className="text-center sm:border-r sm:border-primary/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sin IVA</p>
                  <p className="text-2xl font-bold">{formatCurrency(expense.amount_without_iva)}</p>
                </div>
                <div className="text-center sm:border-r sm:border-primary/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Percent className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">IVA (22%)</p>
                  <p className="text-2xl font-bold text-muted-foreground">
                    {expense.iva > 0 ? formatCurrency(expense.iva) : '-'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Factura</p>
                  <p className="text-2xl font-bold">
                    {expense.has_invoice ? (
                      <span className="text-emerald-600">Si</span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Detalles del gasto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Fecha</p>
                    <p className="font-medium">{formatDate(expense.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Mes contable</p>
                    <p className="font-medium">{expense.accounting_month}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Categoria</p>
                    <p className="font-medium">{expense.category.name}</p>
                    {expense.subcategory && (
                      <p className="text-xs text-muted-foreground">{expense.subcategory}</p>
                    )}
                  </div>
                </div>

                {expense.supplier && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                      <Building className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Proveedor</p>
                      <p className="font-medium">{expense.supplier}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Tipo:</span>
                  <StatusBadge status={expense.expense_type} type="expenseType" showDot />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <StatusBadge status={expense.status} type="expense" showDot />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info (for deferred payments) */}
          {expense.expense_type === 'diferido' && (
            <Card className="shadow-sm border-sky-200 bg-sky-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2 text-sky-800">
                  <CreditCard className="h-4 w-4" />
                  Pago Diferido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {expense.due_date && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white border-2 border-sky-200">
                    <div className="h-12 w-12 rounded-xl bg-sky-100 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-xs text-sky-700 uppercase tracking-wider">Fecha de vencimiento</p>
                      <p className="text-xl font-bold text-sky-900">{formatDate(expense.due_date)}</p>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {expense.payment_method && (
                    <div className="bg-white rounded-xl p-4 border border-sky-200">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Medio de pago</p>
                      <p className="font-semibold text-sky-800">{expense.payment_method}</p>
                    </div>
                  )}
                  {expense.check_number && (
                    <div className="bg-white rounded-xl p-4 border border-sky-200">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Numero de cheque</p>
                      <p className="font-semibold text-sky-800">{expense.check_number}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recurrence Info */}
          {expense.expense_type === 'recurrente' && (
            <Card className="shadow-sm border-violet-200 bg-violet-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2 text-violet-800">
                  <RotateCcw className="h-4 w-4" />
                  Gasto Recurrente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="bg-white rounded-xl p-4 border border-violet-200">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Frecuencia</p>
                    <p className="font-semibold text-violet-800">
                      {expense.recurrence_frequency 
                        ? RECURRENCE_FREQUENCY_LABELS[expense.recurrence_frequency]
                        : '-'}
                    </p>
                  </div>
                  {expense.estimated_day && (
                    <div className="bg-white rounded-xl p-4 border border-violet-200">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Dia estimado</p>
                      <p className="font-semibold text-violet-800">Dia {expense.estimated_day}</p>
                    </div>
                  )}
                  {expense.estimated_amount && (
                    <div className="bg-white rounded-xl p-4 border border-violet-200">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Monto estimado</p>
                      <p className="font-semibold text-violet-800">{formatCurrency(expense.estimated_amount)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {expense.notes && (
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{expense.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Summary */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Calculo de IVA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-muted-foreground">Monto total</span>
                <span className="font-bold text-lg">{formatCurrency(expense.amount)}</span>
              </div>

              {expense.has_invoice ? (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Base imponible</span>
                    <span className="font-medium">{formatCurrency(expense.amount_without_iva)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">IVA (22%)</span>
                    <span className="font-medium">{formatCurrency(expense.iva)}</span>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                    <div className="flex items-center gap-2 text-sm text-emerald-700">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Con factura - IVA deducible</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-muted rounded-xl p-4 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Sin factura</p>
                  <p className="text-xs text-muted-foreground">No se deduce IVA</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado actual</span>
                <StatusBadge status={expense.status} type="expense" showDot />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
