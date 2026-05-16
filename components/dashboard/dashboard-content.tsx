'use client'

import { useEffect, useState, useMemo } from 'react'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { StatusBadge } from '@/components/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DollarSign,
  TrendingDown,
  Package,
  Scale,
  Clock,
  CheckCircle,
  Truck,
  CreditCard,
  AlertCircle,
  RotateCcw,
  Calendar,
  ArrowRight,
  ChevronDown,
  Receipt,
  TrendingUp,
  Minus,
} from 'lucide-react'
import {
  formatCurrency,
  formatDate,
  formatWeight,
  getUpcomingExpenses,
  getRecurrentExpenses,
} from '@/lib/mock-data'
import {
  calculateRealDashboardStats,
  calculateIvaStats,
  getAllRealOrdersInPeriod,
  getCurrentMonth,
  getDateRangeForPeriod,
  getPeriodLabel,
  type PeriodFilter,
  type PeriodMode,
  type IvaStats,
} from '@/lib/dashboard-stats'
import type { DashboardStats, Order } from '@/lib/types'
import Link from 'next/link'

// ─── Period Selector Component ────────────────────────────────────────────────

function PeriodSelector({
  period,
  onChange,
}: {
  period: PeriodFilter
  onChange: (p: PeriodFilter) => void
}) {
  const currentMonth = getCurrentMonth()

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 bg-muted/40 rounded-xl border border-border">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Período</Label>
        <Select
          value={period.mode}
          onValueChange={(v) => {
            const mode = v as PeriodMode
            if (mode === 'this_month') onChange({ mode: 'this_month' })
            else if (mode === 'specific_month') onChange({ mode: 'specific_month', month: currentMonth })
            else onChange({ mode: 'range', from: currentMonth, to: currentMonth })
          }}
        >
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_month">Este mes</SelectItem>
            <SelectItem value="specific_month">Mes específico</SelectItem>
            <SelectItem value="range">Rango de meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {period.mode === 'specific_month' && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Mes</Label>
          <Input
            type="month"
            value={period.month || currentMonth}
            onChange={(e) => onChange({ ...period, month: e.target.value })}
            className="h-9 text-sm w-40"
          />
        </div>
      )}

      {period.mode === 'range' && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Desde</Label>
            <Input
              type="month"
              value={period.from || currentMonth}
              onChange={(e) => onChange({ ...period, from: e.target.value })}
              className="h-9 text-sm w-40"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Hasta</Label>
            <Input
              type="month"
              value={period.to || period.from || currentMonth}
              onChange={(e) => onChange({ ...period, to: e.target.value })}
              className="h-9 text-sm w-40"
            />
          </div>
        </>
      )}

      <div className="flex items-end pb-0.5">
        <span className="text-sm font-medium text-foreground capitalize">
          {getPeriodLabel(period)}
        </span>
      </div>

      {period.mode !== 'this_month' && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-xs text-muted-foreground"
          onClick={() => onChange({ mode: 'this_month' })}
        >
          Restablecer
        </Button>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DashboardContent() {
  const [period, setPeriod] = useState<PeriodFilter>({ mode: 'this_month' })
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [realOrders, setRealOrders] = useState<Order[]>([])
  const [ivaStats, setIvaStats] = useState<IvaStats>({ ivaVentas: 0, ivaCompras: 0, saldoIva: 0 })
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const realStats = calculateRealDashboardStats(period)
    setStats(realStats)

    const orders = getAllRealOrdersInPeriod(period)
    setRealOrders(orders)

    setIvaStats(calculateIvaStats(period))

    if (!isHydrated) setIsHydrated(true)
  }, [period])

  const dashboardStats = useMemo(() => {
    if (!stats) {
      return {
        monthly_sales_without_iva: 0,
        monthly_sales_with_iva: 0,
        monthly_expenses: 0,
        enduido_kg_sold: 0,
        masilla_kg_sold: 0,
      }
    }
    return stats
  }, [stats])

  // Order status counts
  const ordersEnProduccion = realOrders.filter(o => o.status === 'en_produccion').length
  const ordersFinalizados = realOrders.filter(o => o.status === 'finalizado').length
  const ordersEntregados = realOrders.filter(o => o.status === 'entregado').length
  const ordersPendientesCobro = realOrders.filter(o => o.payment_status === 'pendiente').length

  // Recent orders sorted newest first
  const recentOrders = useMemo(() => {
    return [...realOrders]
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
      .slice(0, 5)
  }, [realOrders])

  const upcomingExpenses = getUpcomingExpenses()
  const recurrentExpenses = getRecurrentExpenses()

  const margin = dashboardStats.monthly_sales_without_iva - dashboardStats.monthly_expenses
  const marginPositive = margin >= 0
  const periodLabel = getPeriodLabel(period)

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <PageHeader
        title="Dashboard"
        description="Centro de control - Datos en tiempo real"
      />

      {/* Period Selector */}
      <PeriodSelector period={period} onChange={setPeriod} />

      {/* Primary KPIs */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <StatCard
          title="Ventas del período (sin IVA)"
          value={formatCurrency(dashboardStats.monthly_sales_without_iva)}
          subtitle={`Base imponible · ${periodLabel}`}
          icon={DollarSign}
          variant="primary"
          size="lg"
        />
        <StatCard
          title="Ventas del período (con IVA)"
          value={formatCurrency(dashboardStats.monthly_sales_with_iva)}
          subtitle={`Facturado · ${periodLabel}`}
          icon={DollarSign}
          variant="default"
          size="lg"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Gastos del período"
          value={formatCurrency(dashboardStats.monthly_expenses)}
          subtitle={periodLabel}
          icon={TrendingDown}
          variant="warning"
        />
        <StatCard
          title="Margen bruto"
          value={formatCurrency(margin)}
          subtitle={marginPositive ? 'Positivo' : 'Negativo'}
          icon={DollarSign}
          variant={marginPositive ? 'success' : 'warning'}
        />
        <StatCard
          title="Enduido vendido"
          value={formatWeight(dashboardStats.enduido_kg_sold)}
          subtitle={periodLabel}
          icon={Package}
          variant="info"
        />
        <StatCard
          title="Masilla vendida"
          value={formatWeight(dashboardStats.masilla_kg_sold)}
          subtitle={periodLabel}
          icon={Scale}
          variant="info"
        />
      </div>

      {/* IVA Balance */}
      {(() => {
        const { ivaVentas, ivaCompras, saldoIva } = ivaStats
        const isAPagar = saldoIva > 0
        const isAFavor = saldoIva < 0
        const absBalance = Math.abs(saldoIva)

        return (
          <Card className="shadow-sm">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                Saldo IVA del período
                <span className="ml-auto text-xs font-normal text-muted-foreground capitalize">{periodLabel}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {/* IVA Ventas */}
                <div className="rounded-xl border border-border bg-muted/30 p-3 sm:p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    <span>IVA Ventas</span>
                  </div>
                  <p className="text-base sm:text-xl font-bold text-foreground tabular-nums">
                    {formatCurrency(ivaVentas)}
                  </p>
                  <p className="text-xs text-muted-foreground">Pedidos c/factura</p>
                </div>

                {/* IVA Compras */}
                <div className="rounded-xl border border-border bg-muted/30 p-3 sm:p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingDown className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                    <span>IVA Compras</span>
                  </div>
                  <p className="text-base sm:text-xl font-bold text-foreground tabular-nums">
                    {formatCurrency(ivaCompras)}
                  </p>
                  <p className="text-xs text-muted-foreground">Gastos c/factura</p>
                </div>

                {/* Saldo */}
                <div className={`rounded-xl border-2 p-3 sm:p-4 space-y-1 ${
                  isAPagar
                    ? 'border-rose-200 bg-rose-50'
                    : isAFavor
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-border bg-muted/30'
                }`}>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${
                    isAPagar ? 'text-rose-600' : isAFavor ? 'text-emerald-600' : 'text-muted-foreground'
                  }`}>
                    {isAPagar ? (
                      <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" />
                    ) : isAFavor ? (
                      <TrendingDown className="h-3.5 w-3.5 flex-shrink-0" />
                    ) : (
                      <Minus className="h-3.5 w-3.5 flex-shrink-0" />
                    )}
                    <span>{isAPagar ? 'IVA a pagar' : isAFavor ? 'IVA a favor' : 'Sin saldo'}</span>
                  </div>
                  <p className={`text-base sm:text-xl font-bold tabular-nums ${
                    isAPagar ? 'text-rose-700' : isAFavor ? 'text-emerald-700' : 'text-foreground'
                  }`}>
                    {formatCurrency(absBalance)}
                  </p>
                  <p className={`text-xs ${
                    isAPagar ? 'text-rose-500' : isAFavor ? 'text-emerald-500' : 'text-muted-foreground'
                  }`}>
                    {isAPagar ? 'Ventas > Compras' : isAFavor ? 'Compras > Ventas' : 'Equilibrio'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })()}

      {/* Orders Summary */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Estado de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Link href="/pedidos?status=en_produccion" className="group">
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3 transition-all hover:border-amber-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-amber-800 truncate">En produccion</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-700">{ordersEnProduccion}</p>
                </div>
              </Link>

              <Link href="/pedidos?status=finalizado" className="group">
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-3 transition-all hover:border-blue-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-blue-800 truncate">Finalizados</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-700">{ordersFinalizados}</p>
                </div>
              </Link>

              <Link href="/pedidos?status=entregado" className="group">
                <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 transition-all hover:border-emerald-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Truck className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-emerald-800 truncate">Entregados</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-700">{ordersEntregados}</p>
                </div>
              </Link>

              <Link href="/pedidos?payment=pendiente" className="group">
                <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-3 transition-all hover:border-orange-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-orange-800 truncate">Pend. cobro</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-700">{ordersPendientesCobro}</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2 min-w-0">
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="truncate">Ultimos Pedidos</span>
              </CardTitle>
              <Link href="/pedidos" className="text-xs sm:text-sm text-primary hover:underline flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
                Ver todos
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/pedidos/${order.id}`}
                    className="flex items-center justify-between gap-2 p-2 sm:p-3 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">#{order.order_number}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-foreground truncate">{order.client?.name || 'Sin nombre'}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.order_date)}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1 flex-shrink-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">{formatCurrency(order.total)}</p>
                      <StatusBadge status={order.status} type="order" size="sm" showDot />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No hay pedidos en este período</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expenses Summary */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Proximos Vencimientos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {upcomingExpenses.length > 0 ? (
              <div className="space-y-2">
                {upcomingExpenses.slice(0, 4).map((expense) => (
                  <Link
                    key={expense.id}
                    href={`/gastos/${expense.id}`}
                    className="flex items-center justify-between gap-2 p-2 sm:p-3 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-orange-200 transition-all"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{expense.concept}</p>
                      <div className="flex items-center gap-2 text-xs text-orange-600 flex-shrink-0">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">Vence: {formatDate(expense.due_date!)}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1 flex-shrink-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">{formatCurrency(expense.amount)}</p>
                      <StatusBadge status={expense.expense_type} type="expenseType" size="sm" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No hay vencimientos proximos</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-violet-500" />
              Gastos Recurrentes
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {recurrentExpenses.length > 0 ? (
              <div className="space-y-2">
                {recurrentExpenses.slice(0, 4).map((expense) => (
                  <Link
                    key={expense.id}
                    href={`/gastos/${expense.id}`}
                    className="flex items-center justify-between gap-2 p-2 sm:p-3 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-violet-200 transition-all"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{expense.concept}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {expense.category.name} - Dia {expense.estimated_day}
                      </p>
                    </div>
                    <div className="text-right space-y-1 flex-shrink-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                        {formatCurrency(expense.estimated_amount || expense.amount)}
                      </p>
                      <span className="text-xs text-violet-600 font-medium capitalize bg-violet-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {expense.recurrence_frequency}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <RotateCcw className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No hay gastos recurrentes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
