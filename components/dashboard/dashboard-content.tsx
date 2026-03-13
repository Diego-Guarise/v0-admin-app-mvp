'use client'

import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { StatusBadge } from '@/components/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  ArrowRight
} from 'lucide-react'
import { 
  DASHBOARD_STATS, 
  ORDERS, 
  formatCurrency, 
  formatDate,
  formatWeight,
  getOrdersByStatus,
  getOrdersByPaymentStatus,
  getUpcomingExpenses,
  getRecurrentExpenses,
} from '@/lib/mock-data'
import Link from 'next/link'

export function DashboardContent() {
  const ordersEnProduccion = getOrdersByStatus('en_produccion')
  const ordersFinalizados = getOrdersByStatus('finalizado')
  const ordersEntregados = getOrdersByStatus('entregado')
  const ordersPendientesCobro = getOrdersByPaymentStatus('pendiente')
  const upcomingExpenses = getUpcomingExpenses()
  const recurrentExpenses = getRecurrentExpenses()

  // Calculate margin
  const margin = DASHBOARD_STATS.monthly_sales_without_iva - DASHBOARD_STATS.monthly_expenses
  const marginPositive = margin >= 0

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <PageHeader 
        title="Dashboard"
        description="Centro de control - Marzo 2025"
      />

      {/* Primary KPIs - 2 large cards for sales */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Ventas del mes (sin IVA)"
          value={formatCurrency(DASHBOARD_STATS.monthly_sales_without_iva)}
          subtitle="Base imponible marzo 2025"
          icon={DollarSign}
          variant="primary"
          size="lg"
        />
        <StatCard
          title="Ventas del mes (con IVA)"
          value={formatCurrency(DASHBOARD_STATS.monthly_sales_with_iva)}
          subtitle="Facturado marzo 2025"
          icon={DollarSign}
          variant="default"
          size="lg"
        />
      </div>

      {/* Secondary KPIs - expenses and kg */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Gastos del mes"
          value={formatCurrency(DASHBOARD_STATS.monthly_expenses)}
          subtitle="Marzo 2025"
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
          value={formatWeight(DASHBOARD_STATS.enduido_kg_sold)}
          subtitle="Marzo 2025"
          icon={Package}
          variant="info"
        />
        <StatCard
          title="Masilla vendida"
          value={formatWeight(DASHBOARD_STATS.masilla_kg_sold)}
          subtitle="Marzo 2025"
          icon={Scale}
          variant="info"
        />
      </div>

      {/* Orders Summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Orders by Status */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Estado de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/pedidos?status=en_produccion" className="group">
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 transition-all hover:border-amber-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-amber-800">En produccion</span>
                  </div>
                  <p className="text-3xl font-bold text-amber-700">{ordersEnProduccion.length}</p>
                </div>
              </Link>
              
              <Link href="/pedidos?status=finalizado" className="group">
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 transition-all hover:border-blue-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-blue-800">Finalizados</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">{ordersFinalizados.length}</p>
                </div>
              </Link>
              
              <Link href="/pedidos?status=entregado" className="group">
                <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 transition-all hover:border-emerald-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Truck className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-emerald-800">Entregados</span>
                  </div>
                  <p className="text-3xl font-bold text-emerald-700">{ordersEntregados.length}</p>
                </div>
              </Link>
              
              <Link href="/pedidos?payment=pendiente" className="group">
                <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4 transition-all hover:border-orange-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-orange-800">Pend. cobro</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-700">{ordersPendientesCobro.length}</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Ultimos Pedidos
              </CardTitle>
              <Link href="/pedidos" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {ORDERS.slice(0, 5).map((order) => (
              <Link 
                key={order.id} 
                href={`/pedidos/${order.id}`}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">#{order.order_number}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{order.client?.name || 'Sin nombre'}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.order_date)}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(order.total)}</p>
                  <StatusBadge status={order.status} type="order" size="sm" showDot />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Expenses Summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Upcoming Due Dates */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Proximos Vencimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingExpenses.length > 0 ? (
              <div className="space-y-2">
                {upcomingExpenses.slice(0, 4).map((expense) => (
                  <Link
                    key={expense.id}
                    href={`/gastos/${expense.id}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-orange-200 transition-all"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{expense.concept}</p>
                      <div className="flex items-center gap-2 text-xs text-orange-600">
                        <Calendar className="h-3 w-3" />
                        Vence: {formatDate(expense.due_date!)}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(expense.amount)}</p>
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

        {/* Recurrent Expenses */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-violet-500" />
              Gastos Recurrentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recurrentExpenses.length > 0 ? (
              <div className="space-y-2">
                {recurrentExpenses.slice(0, 4).map((expense) => (
                  <Link
                    key={expense.id}
                    href={`/gastos/${expense.id}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-violet-200 transition-all"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{expense.concept}</p>
                      <p className="text-xs text-muted-foreground">
                        {expense.category.name} - Dia {expense.estimated_day}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(expense.estimated_amount || expense.amount)}
                      </p>
                      <span className="text-xs text-violet-600 font-medium capitalize bg-violet-50 px-2 py-0.5 rounded-full">
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
