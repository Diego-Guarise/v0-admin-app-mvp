import { cn } from '@/lib/utils'
import type { OrderStatus, PaymentStatus, ExpenseStatus, ExpenseType, CommissionStatus, ClientStatus } from '@/lib/types'
import { 
  ORDER_STATUS_LABELS, 
  PAYMENT_STATUS_LABELS, 
  EXPENSE_STATUS_LABELS,
  EXPENSE_TYPE_LABELS,
  COMMISSION_STATUS_LABELS,
  CLIENT_STATUS_LABELS,
} from '@/lib/types'

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | ExpenseStatus | ExpenseType | CommissionStatus | ClientStatus
  type: 'order' | 'payment' | 'expense' | 'expenseType' | 'commission' | 'client'
  size?: 'sm' | 'md'
  showDot?: boolean
}

const orderStatusColors: Record<OrderStatus, string> = {
  en_produccion: 'bg-amber-100 text-amber-800 border-amber-300',
  finalizado: 'bg-blue-100 text-blue-800 border-blue-300',
  entregado: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  anulado: 'bg-red-100 text-red-800 border-red-300',
}

const paymentStatusColors: Record<PaymentStatus, string> = {
  pendiente: 'bg-orange-100 text-orange-800 border-orange-300',
  parcial: 'bg-amber-100 text-amber-800 border-amber-300',
  cobrado: 'bg-emerald-100 text-emerald-800 border-emerald-300',
}

const commissionStatusColors: Record<CommissionStatus, string> = {
  pendiente_liquidar: 'bg-purple-100 text-purple-800 border-purple-300',
  liquidado: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  excluido: 'bg-slate-100 text-slate-600 border-slate-300',
}

const expenseStatusColors: Record<ExpenseStatus, string> = {
  activo: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  anulado: 'bg-red-100 text-red-800 border-red-300',
}

const expenseTypeColors: Record<ExpenseType, string> = {
  unico: 'bg-slate-100 text-slate-700 border-slate-300',
  recurrente: 'bg-violet-100 text-violet-800 border-violet-300',
  diferido: 'bg-sky-100 text-sky-800 border-sky-300',
}

const clientStatusColors: Record<ClientStatus, string> = {
  activo: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  inactivo: 'bg-slate-100 text-slate-600 border-slate-300',
}

const statusDotColors: Record<string, string> = {
  // Order
  en_produccion: 'bg-amber-500',
  finalizado: 'bg-blue-500',
  entregado: 'bg-emerald-500',
  anulado: 'bg-red-500',
  // Payment
  pendiente: 'bg-orange-500',
  parcial: 'bg-amber-500',
  cobrado: 'bg-emerald-500',
  // Commission
  pendiente_liquidar: 'bg-purple-500',
  liquidado: 'bg-emerald-500',
  excluido: 'bg-slate-400',
  // Expense
  activo: 'bg-emerald-500',
  // Expense Type
  unico: 'bg-slate-400',
  recurrente: 'bg-violet-500',
  diferido: 'bg-sky-500',
  // Client
  inactivo: 'bg-slate-400',
}

export function StatusBadge({ status, type, size = 'md', showDot = false }: StatusBadgeProps) {
  let label: string
  let colorClass: string

  switch (type) {
    case 'order':
      label = ORDER_STATUS_LABELS[status as OrderStatus]
      colorClass = orderStatusColors[status as OrderStatus]
      break
    case 'payment':
      label = PAYMENT_STATUS_LABELS[status as PaymentStatus]
      colorClass = paymentStatusColors[status as PaymentStatus]
      break
    case 'commission':
      label = COMMISSION_STATUS_LABELS[status as CommissionStatus]
      colorClass = commissionStatusColors[status as CommissionStatus]
      break
    case 'expense':
      label = EXPENSE_STATUS_LABELS[status as ExpenseStatus]
      colorClass = expenseStatusColors[status as ExpenseStatus]
      break
    case 'expenseType':
      label = EXPENSE_TYPE_LABELS[status as ExpenseType]
      colorClass = expenseTypeColors[status as ExpenseType]
      break
    case 'client':
      label = CLIENT_STATUS_LABELS[status as ClientStatus]
      colorClass = clientStatusColors[status as ClientStatus]
      break
    default:
      label = status
      colorClass = 'bg-gray-100 text-gray-800 border-gray-300'
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      colorClass,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
    )}>
      {showDot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          statusDotColors[status] || 'bg-gray-400'
        )} />
      )}
      {label}
    </span>
  )
}
