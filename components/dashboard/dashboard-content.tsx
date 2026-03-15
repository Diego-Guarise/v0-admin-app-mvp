'use client'

import { useEffect, useState, useMemo } from 'react'
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
  formatCurrency, 
  formatDate,
  formatWeight,
  getUpcomingExpenses,
  getRecurrentExpenses,
} from '@/lib/mock-data'
import { calculateRealDashboardStats, getAllRealOrdersThisMonth } from '@/lib/dashboard-stats'
import { getCreatedOrders } from '@/lib/order-store'
import type { DashboardStats, Order } from '@/lib/types'
import Link from 'next/link'

export function DashboardContent() {
  // Calculate real dashboard stats from persistent stores
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [realOrders, setRealOrders] = useState<Order[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Calculate stats and get REAL orders only (no seeded/demo) for status counts and recent orders display
  useEffect(() => {
    // Get real data from stores
    const realStats = calculateRealDashboardStats()
    setStats(realStats)
    
    // Get ONLY real created orders (no demo/seeded orders)
    try {
      const createdOrders = getCreatedOrders() || []
      setRealOrders(createdOrders)
      console.log('[v0] Dashboard loaded with REAL orders only:', createdOrders.length)
    } catch (error) {
      console.error('[v0] Error loading real orders:', error)
      setRealOrders([])
    }
    
    setIsHydrated(true)
  }, [])

  // Use real stats if available, fallback to defaults while loading
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

  // Calculate order status counts from REAL data
  const ordersEnProduccion = realOrders.filter(o => o.status === 'en_produccion').length
  const ordersFinalizados = realOrders.filter(o => o.status === 'finalizado').length
  const ordersEntregados = realOrders.filter(o => o.status === 'entregado').length
  const ordersPendientesCobro = realOrders.filter(o => o.payment_status === 'pendiente').length
  
  // Get recent orders sorted by date (most recent first)
  const recentOrders = useMemo(() => {
    return [...realOrders]
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
      .slice(0, 5)
  }, [realOrders])
  
  const upcomingExpenses = getUpcomingExpenses()
  const recurrentExpenses = getRecurrentExpenses()

  // Calculate margin from real data
  const margin = dashboardStats.monthly_sales_without_iva - dashboardStats.monthly_expenses
  const marginPositive = margin >= 0

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <PageHeader 
        title="Dashboard"
        description="Centro de control - Datos en tiempo real"
      />

      {/* Primary KPIs - 2 large cards for sales */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Ventas del mes (sin IVA)"
          value={formatCurrency(dashboardStats.monthly_sales_without_iva)}
          subtitle={`Base imponible ${new Date().toLocaleString('es-UY', { month: 'long', year: 'numeric' })}`}
          icon={DollarSign}
          variant="primary"
          size="lg"
        />
        <StatCard
          title="Ventas del mes (con IVA)"
          value={formatCurrency(dashboardStats.monthly_sales_with_iva)}
          subtitle={`Facturado ${new Date().toLocaleString('es-UY', { month: 'long', year: 'numeric' })}`}
          icon={DollarSign}
          variant="default"
          size="lg"
        />
      </div>

      {/* Secondary KPIs - expenses and kg */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Gastos del mes"
          value={formatCurrency(dashboardStats.monthly_expenses)}
          subtitle={`${new Date().toLocaleString('es-UY', { month: 'long', year: 'numeric' })}`}
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
          subtitle={`${new Date().toLocaleString('es-UY', { month: 'long', year: 'numeric' })}`}
          icon={Package}
          variant="info"
        />
        <StatCard
          title="Masilla vendida"
          value={formatWeight(dashboardStats.masilla_kg_sold)}
          subtitle={`${new Date().toLocaleString('es-UY', { month: 'long', year: 'numeric' })}`}
          icon={Scale}
          variant="info"
        />
      </div>

      {/* Orders Summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Orders by Status - NOW USING REAL DATA */}
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
                  <p className="text-3xl font-bold text-amber-700">{ordersEnProduccion}</p>
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
                  <p className="text-3xl font-bold text-blue-700">{ordersFinalizados}</p>
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
                  <p className="text-3xl font-bold text-emerald-700">{ordersEntregados}</p>
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
                  <p className="text-3xl font-bold text-orange-700">{ordersPendientesCobro}</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders - NOW USING REAL DATA */}
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
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-2">
                {recentOrders.map((order) => (
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
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No hay pedidos</p>
              </div>
            )}
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
