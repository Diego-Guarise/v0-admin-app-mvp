import { cn } from '@/lib/utils'
import type { OrderStatus, PaymentStatus, ExpenseStatus, ExpenseType } from '@/lib/types'
import { 
  ORDER_STATUS_LABELS, 
  PAYMENT_STATUS_LABELS, 
  EXPENSE_STATUS_LABELS,
  EXPENSE_TYPE_LABELS 
} from '@/lib/types'

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | ExpenseStatus | ExpenseType
  type: 'order' | 'payment' | 'expense' | 'expenseType'
  size?: 'sm' | 'md'
}

const orderStatusColors: Record<OrderStatus, string> = {
  en_produccion: 'bg-amber-100 text-amber-800 border-amber-200',
  finalizado: 'bg-blue-100 text-blue-800 border-blue-200',
  entregado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cobrado: 'bg-primary/10 text-primary border-primary/20',
  anulado: 'bg-red-100 text-red-800 border-red-200',
}

const paymentStatusColors: Record<PaymentStatus, string> = {
  pendiente: 'bg-orange-100 text-orange-800 border-orange-200',
  parcial: 'bg-amber-100 text-amber-800 border-amber-200',
  cobrado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

const expenseStatusColors: Record<ExpenseStatus, string> = {
  activo: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  anulado: 'bg-red-100 text-red-800 border-red-200',
}

const expenseTypeColors: Record<ExpenseType, string> = {
  unico: 'bg-slate-100 text-slate-800 border-slate-200',
  recurrente: 'bg-purple-100 text-purple-800 border-purple-200',
  diferido: 'bg-blue-100 text-blue-800 border-blue-200',
}

export function StatusBadge({ status, type, size = 'md' }: StatusBadgeProps) {
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
    case 'expense':
      label = EXPENSE_STATUS_LABELS[status as ExpenseStatus]
      colorClass = expenseStatusColors[status as ExpenseStatus]
      break
    case 'expenseType':
      label = EXPENSE_TYPE_LABELS[status as ExpenseType]
      colorClass = expenseTypeColors[status as ExpenseType]
      break
    default:
      label = status
      colorClass = 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium',
      colorClass,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
    )}>
      {label}
    </span>
  )
}
