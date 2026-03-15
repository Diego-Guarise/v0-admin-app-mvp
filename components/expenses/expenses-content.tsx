'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Search, Receipt, Eye, Edit, X, FileText, Calendar } from 'lucide-react'
import { EXPENSE_CATEGORIES, formatCurrency, formatDate, EXPENSES } from '@/lib/mock-data'
import type { ExpenseType, ExpenseStatus, Expense } from '@/lib/types'
import { EXPENSE_TYPE_LABELS, EXPENSE_STATUS_LABELS, RECURRENCE_FREQUENCY_LABELS } from '@/lib/types'
import { getExpenses, initializeExpenses } from '@/lib/expenses-store'

export function ExpensesContent() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<ExpenseType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'all'>('all')
  const [invoiceFilter, setInvoiceFilter] = useState<string>('all')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Initialize expenses from persistent store on mount
  useEffect(() => {
    const persistedExpenses = getExpenses()
    if (persistedExpenses.length > 0) {
      setExpenses(persistedExpenses)
    } else {
      // First time - initialize with defaults from mock-data
      initializeExpenses(EXPENSES)
      setExpenses(EXPENSES)
    }
    setIsHydrated(true)
  }, [])

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch = 
          expense.concept.toLowerCase().includes(searchLower) ||
          expense.supplier?.toLowerCase().includes(searchLower) ||
          expense.category.name.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Category filter
      if (categoryFilter !== 'all' && expense.category_id !== categoryFilter) return false

      // Type filter
      if (typeFilter !== 'all' && expense.expense_type !== typeFilter) return false

      // Status filter
      if (statusFilter !== 'all' && expense.status !== statusFilter) return false

      // Invoice filter
      if (invoiceFilter === 'with' && !expense.has_invoice) return false
      if (invoiceFilter === 'without' && expense.has_invoice) return false

      return true
    }).sort((a, b) => {
      // Sort by date DESC, then created_at DESC as tie-breaker
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime()
      if (dateCompare !== 0) return dateCompare
      return b.created_at.localeCompare(a.created_at)
    })
  }, [search, categoryFilter, typeFilter, statusFilter, invoiceFilter, expenses])

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setTypeFilter('all')
    setStatusFilter('all')
    setInvoiceFilter('all')
  }

  const hasFilters = search || categoryFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all' || invoiceFilter !== 'all'

  // Calculate totals
  const totals = useMemo(() => {
    return filteredExpenses.reduce(
      (acc, e) => ({
        total: acc.total + e.amount,
        withoutIva: acc.withoutIva + e.amount_without_iva,
        iva: acc.iva + e.iva,
      }),
      { total: 0, withoutIva: 0, iva: 0 }
    )
  }, [filteredExpenses])

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <PageHeader 
        title="Gastos"
        description={`${filteredExpenses.length} gasto${filteredExpenses.length !== 1 ? 's' : ''}`}
      >
        <Link href="/gastos/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Gasto
          </Button>
        </Link>
      </PageHeader>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por concepto, proveedor o categoria..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Clear filters */}
              {hasFilters && (
                <Button variant="ghost" onClick={clearFilters} className="shrink-0">
                  <X className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Category filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorias</SelectItem>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type filter */}
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ExpenseType | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {Object.entries(EXPENSE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status filter */}
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ExpenseStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(EXPENSE_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Invoice filter */}
              <Select value={invoiceFilter} onValueChange={setInvoiceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Factura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Con/Sin factura</SelectItem>
                  <SelectItem value="with">Con factura</SelectItem>
                  <SelectItem value="without">Sin factura</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      {filteredExpenses.length > 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Fecha</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Sin IVA</TableHead>
                    <TableHead className="text-center">Factura</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id} className="group hover:bg-accent/50">
                      <TableCell className="text-muted-foreground">
                        {formatDate(expense.date)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{expense.concept}</p>
                          {expense.due_date && (
                            <div className="flex items-center gap-1 text-xs text-orange-600">
                              <Calendar className="h-3 w-3" />
                              Vence: {formatDate(expense.due_date)}
                            </div>
                          )}
                          {expense.expense_type === 'recurrente' && expense.recurrence_frequency && (
                            <div className="text-xs text-violet-600">
                              {RECURRENCE_FREQUENCY_LABELS[expense.recurrence_frequency]} - Dia {expense.estimated_day}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{expense.category.name}</p>
                          {expense.subcategory && (
                            <p className="text-xs text-muted-foreground">{expense.subcategory}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {expense.supplier || '-'}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-muted-foreground">
                        {formatCurrency(expense.amount_without_iva)}
                      </TableCell>
                      <TableCell className="text-center">
                        {expense.has_invoice ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200">
                            <FileText className="h-3 w-3 mr-1" />
                            Si
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={expense.expense_type} type="expenseType" size="sm" showDot />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Link href={`/gastos/${expense.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/gastos/${expense.id}/editar`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="border-t px-6 py-4 bg-muted/20">
              <div className="flex flex-wrap gap-6 justify-end text-sm">
                <div>
                  <span className="text-muted-foreground">Total sin IVA:</span>
                  <span className="font-semibold ml-2">{formatCurrency(totals.withoutIva)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">IVA:</span>
                  <span className="font-semibold ml-2">{formatCurrency(totals.iva)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold ml-2 text-primary">{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <EmptyState
              icon={Receipt}
              title="No se encontraron gastos"
              description={hasFilters 
                ? "Intenta ajustar los filtros de busqueda" 
                : "Registra tu primer gasto para comenzar"
              }
              action={
                hasFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                ) : (
                  <Link href="/gastos/nuevo">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Gasto
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
