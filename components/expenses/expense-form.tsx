'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Receipt, Calendar, CreditCard, RotateCcw, Package } from 'lucide-react'
import { EXPENSE_CATEGORIES, formatCurrency, INGREDIENT_INPUTS, isProductiveExpense } from '@/lib/mock-data'
import { EXPENSE_TYPE_LABELS, EXPENSE_STATUS_LABELS, UNIT_OF_MEASURE_ABBR, type UnitOfMeasure } from '@/lib/types'
import type { Expense, ExpenseType, ExpenseStatus, RecurrenceFrequency } from '@/lib/types'

interface ExpenseFormProps {
  expense?: Expense
}

const RECURRENCE_FREQUENCIES: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'bimestral', label: 'Bimestral' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
]

export function ExpenseForm({ expense }: ExpenseFormProps) {
  const router = useRouter()
  const isEditing = !!expense

  // Form state
  const [date, setDate] = useState(expense?.date || new Date().toISOString().split('T')[0])
  const [accountingMonth, setAccountingMonth] = useState(expense?.accounting_month || new Date().toISOString().slice(0, 7))
  const [concept, setConcept] = useState(expense?.concept || '')
  const [categoryId, setCategoryId] = useState(expense?.category_id || '')
  const [subcategory, setSubcategory] = useState(expense?.subcategory || '')
  const [supplier, setSupplier] = useState(expense?.supplier || '')
  const [amount, setAmount] = useState(expense?.amount || 0)
  const [hasInvoice, setHasInvoice] = useState(expense?.has_invoice ?? true)
  const [notes, setNotes] = useState(expense?.notes || '')
  const [expenseType, setExpenseType] = useState<ExpenseType>(expense?.expense_type || 'unico')
  const [status, setStatus] = useState<ExpenseStatus>(expense?.status || 'activo')

  // Deferred payment fields
  const [dueDate, setDueDate] = useState(expense?.due_date || '')
  const [paymentMethod, setPaymentMethod] = useState(expense?.payment_method || '')
  const [checkNumber, setCheckNumber] = useState(expense?.check_number || '')

  // Recurrence fields
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>(expense?.recurrence_frequency || 'mensual')
  const [estimatedDay, setEstimatedDay] = useState(expense?.estimated_day || 1)
  const [estimatedAmount, setEstimatedAmount] = useState(expense?.estimated_amount || 0)

  // Productive purchase fields (for materia prima, envases, etiquetas)
  const [insumoId, setInsumoId] = useState(expense?.insumo_id || '')
  const [quantity, setQuantity] = useState(expense?.quantity || 0)
  const [unitOfMeasure, setUnitOfMeasure] = useState<UnitOfMeasure>(expense?.unit_of_measure || 'kg')

  // Get subcategories for selected category
  const selectedCategory = EXPENSE_CATEGORIES.find(c => c.id === categoryId)
  const subcategories = selectedCategory?.subcategories || []

  // Calculate IVA
  const calculations = useMemo(() => {
    if (hasInvoice && amount > 0) {
      const amountWithoutIva = amount / 1.22
      const iva = amount - amountWithoutIva
      return { amountWithoutIva, iva }
    }
    return { amountWithoutIva: amount, iva: 0 }
  }, [amount, hasInvoice])

  // Reset subcategory when category changes
  useEffect(() => {
    if (!subcategories.includes(subcategory)) {
      setSubcategory('')
    }
  }, [categoryId, subcategories, subcategory])

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would save to the database
    console.log('[v0] Expense submitted:', {
      date,
      accountingMonth,
      concept,
      categoryId,
      subcategory,
      supplier,
      amount,
      hasInvoice,
      notes,
      expenseType,
      status,
      dueDate,
      paymentMethod,
      checkNumber,
      recurrenceFrequency,
      estimatedDay,
      estimatedAmount,
      // Productive purchase fields
      ...(isProductiveExpense(categoryId) && {
        insumoId,
        quantity,
        unitOfMeasure,
      }),
      calculations,
    })
    router.push('/gastos')
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 lg:px-6 py-6 space-y-6">
      <PageHeader 
        title={isEditing ? 'Editar Gasto' : 'Nuevo Gasto'}
        description={isEditing ? 'Modifica los datos del gasto' : 'Registra un nuevo gasto'}
      >
        <Link href={isEditing ? `/gastos/${expense.id}` : '/gastos'}>
          <Button type="button" variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </Link>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Guardar cambios' : 'Registrar gasto'}
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Información básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountingMonth">Mes contable *</Label>
                  <Input
                    id="accountingMonth"
                    type="month"
                    value={accountingMonth}
                    onChange={(e) => setAccountingMonth(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="concept">Concepto *</Label>
                <Input
                  id="concept"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Descripción del gasto"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategoría</Label>
                  <Select 
                    value={subcategory} 
                    onValueChange={setSubcategory}
                    disabled={subcategories.length === 0}
                  >
                    <SelectTrigger id="subcategory">
                      <SelectValue placeholder={subcategories.length > 0 ? "Seleccionar" : "Sin subcategorías"} />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Proveedor</Label>
                <Input
                  id="supplier"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Nombre del proveedor"
                />
              </div>
            </CardContent>
          </Card>

          {/* Amount */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="font-bold">$</span>
                Monto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto total *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="space-y-2 flex items-center gap-4 pt-6">
                  <Switch
                    id="hasInvoice"
                    checked={hasInvoice}
                    onCheckedChange={setHasInvoice}
                  />
                  <Label htmlFor="hasInvoice">Con factura (deduce IVA)</Label>
                </div>
              </div>

              {amount > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-xs text-muted-foreground">Monto sin IVA</p>
                    <p className="text-xl font-bold">{formatCurrency(calculations.amountWithoutIva)}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-xs text-muted-foreground">IVA</p>
                    <p className="text-xl font-bold">
                      {hasInvoice ? formatCurrency(calculations.iva) : '-'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Productive Purchase Fields */}
          {isProductiveExpense(categoryId) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Detalles de la compra productiva
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="insumo">Insumo</Label>
                  <Select value={insumoId} onValueChange={setInsumoId}>
                    <SelectTrigger id="insumo">
                      <SelectValue placeholder="Seleccionar insumo" />
                    </SelectTrigger>
                    <SelectContent>
                      {INGREDIENT_INPUTS.map((insumo) => (
                        <SelectItem key={insumo.id} value={insumo.id}>
                          {insumo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad comprada</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      step="0.001"
                      value={quantity}
                      onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                      placeholder="ej: 1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitOfMeasure">Unidad de compra</Label>
                    <Select value={unitOfMeasure} onValueChange={(v) => setUnitOfMeasure(v as UnitOfMeasure)}>
                      <SelectTrigger id="unitOfMeasure">
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
                </div>

                {quantity > 0 && amount > 0 && (
                  <div className="bg-muted rounded-lg p-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Costo unitario</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(calculations.amountWithoutIva / quantity)}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        /{UNIT_OF_MEASURE_ABBR[unitOfMeasure]}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Tipo de gasto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expenseType">Tipo *</Label>
                <Select value={expenseType} onValueChange={(v) => setExpenseType(v as ExpenseType)}>
                  <SelectTrigger id="expenseType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EXPENSE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Deferred payment fields */}
              {expenseType === 'diferido' && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>Información de pago diferido</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Fecha de vencimiento</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Medio de pago</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger id="paymentMethod">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cheque">Cheque</SelectItem>
                          <SelectItem value="Transferencia">Transferencia</SelectItem>
                          <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkNumber">N° de cheque</Label>
                      <Input
                        id="checkNumber"
                        value={checkNumber}
                        onChange={(e) => setCheckNumber(e.target.value)}
                        placeholder="CH-0000"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Recurrence fields */}
              {expenseType === 'recurrente' && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RotateCcw className="h-4 w-4" />
                    <span>Configuración de recurrencia</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frecuencia</Label>
                      <Select value={recurrenceFrequency} onValueChange={(v) => setRecurrenceFrequency(v as RecurrenceFrequency)}>
                        <SelectTrigger id="frequency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RECURRENCE_FREQUENCIES.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedDay">Día estimado</Label>
                      <Input
                        id="estimatedDay"
                        type="number"
                        min="1"
                        max="31"
                        value={estimatedDay}
                        onChange={(e) => setEstimatedDay(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedAmount">Monto estimado</Label>
                      <Input
                        id="estimatedAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={estimatedAmount}
                        onChange={(e) => setEstimatedAmount(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales..."
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={status} onValueChange={(v) => setStatus(v as ExpenseStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EXPENSE_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monto ingresado</span>
                <span className="font-medium">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sin IVA</span>
                <span className="font-medium">{formatCurrency(calculations.amountWithoutIva)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA</span>
                <span className="font-medium">
                  {hasInvoice ? formatCurrency(calculations.iva) : '-'}
                </span>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="flex justify-between w-full">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary">{formatCurrency(amount)}</span>
              </div>
            </CardFooter>
          </Card>

          {/* Help */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium text-foreground">Cálculo de IVA</p>
                <p>Si el gasto tiene factura, el IVA se calcula automáticamente:</p>
                <p className="font-mono text-xs bg-muted p-2 rounded">
                  IVA = Monto - (Monto / 1.22)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
