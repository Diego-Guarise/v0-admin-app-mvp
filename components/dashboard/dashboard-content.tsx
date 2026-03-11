'use client'

import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { StatusBadge } from '@/components/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DollarSign, 
  Receipt, 
  Package,
  Scale,
  Clock,
  CheckCircle,
  Truck,
  CreditCard,
  AlertCircle,
  RotateCcw
} from 'lucide-react'
import { 
  DASHBOARD_STATS, 
  ORDERS, 
  EXPENSES,
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

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <PageHeader 
        title="Dashboard"
        description="Resumen del mes actual"
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Ventas sin IVA"
          value={formatCurrency(DASHBOARD_STATS.monthly_sales_without_iva)}
          subtitle="Marzo 2025"
          icon={DollarSign}
          variant="primary"
        />
        <StatCard
          title="Ventas con IVA"
          value={formatCurrency(DASHBOARD_STATS.monthly_sales_with_iva)}
          subtitle="Marzo 2025"
          icon={DollarSign}
          variant="default"
        />
        <StatCard
          title="Gastos del mes"
          value={formatCurrency(DASHBOARD_STATS.monthly_expenses)}
          subtitle="Marzo 2025"
          icon={Receipt}
          variant="warning"
        />
        <StatCard
          title="Enduido vendido"
          value={formatWeight(DASHBOARD_STATS.enduido_kg_sold)}
          subtitle="Marzo 2025"
          icon={Package}
          variant="success"
        />
        <StatCard
          title="Masilla vendida"
          value={formatWeight(DASHBOARD_STATS.masilla_kg_sold)}
          subtitle="Marzo 2025"
          icon={Scale}
          variant="success"
        />
      </div>

      {/* Orders Summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Orders by Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Estado de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/pedidos?status=en_produccion" className="group">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 transition-colors hover:bg-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">En producción</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-700">{ordersEnProduccion.length}</p>
                </div>
              </Link>
              
              <Link href="/pedidos?status=finalizado" className="group">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 transition-colors hover:bg-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Finalizados</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{ordersFinalizados.length}</p>
                </div>
              </Link>
              
              <Link href="/pedidos?status=entregado" className="group">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 transition-colors hover:bg-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">Entregados</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-700">{ordersEntregados.length}</p>
                </div>
              </Link>
              
              <Link href="/pedidos?payment=pendiente" className="group">
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 transition-colors hover:bg-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Pend. cobro</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">{ordersPendientesCobro.length}</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Últimos Pedidos</CardTitle>
              <Link href="/pedidos" className="text-sm text-primary hover:underline">
                Ver todos
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ORDERS.slice(0, 5).map((order) => (
                <Link 
                  key={order.id} 
                  href={`/pedidos/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">#{order.order_number}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.client.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.order_date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(order.total)}</p>
                    <StatusBadge status={order.status} type="order" size="sm" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Upcoming Due Dates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Próximos Vencimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingExpenses.length > 0 ? (
              <div className="space-y-3">
                {upcomingExpenses.slice(0, 4).map((expense) => (
                  <Link
                    key={expense.id}
                    href={`/gastos/${expense.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{expense.concept}</p>
                      <p className="text-xs text-muted-foreground">
                        Vence: {formatDate(expense.due_date!)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(expense.amount)}</p>
                      <StatusBadge status={expense.expense_type} type="expenseType" size="sm" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay vencimientos próximos
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recurrent Expenses */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-primary" />
              Gastos Recurrentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recurrentExpenses.length > 0 ? (
              <div className="space-y-3">
                {recurrentExpenses.slice(0, 4).map((expense) => (
                  <Link
                    key={expense.id}
                    href={`/gastos/${expense.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{expense.concept}</p>
                      <p className="text-xs text-muted-foreground">
                        {expense.category.name} - Día {expense.estimated_day}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(expense.estimated_amount || expense.amount)}
                      </p>
                      <span className="text-xs text-muted-foreground capitalize">
                        {expense.recurrence_frequency}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay gastos recurrentes configurados
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
