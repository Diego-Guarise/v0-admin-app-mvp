import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info'
  size?: 'default' | 'lg'
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  size = 'default',
}: StatCardProps) {
  return (
    <div className={cn(
      'rounded-xl border p-5 transition-all hover:shadow-md',
      variant === 'default' && 'bg-card border-border',
      variant === 'primary' && 'bg-primary/5 border-primary/20 hover:border-primary/30',
      variant === 'success' && 'bg-emerald-50 border-emerald-200 hover:border-emerald-300',
      variant === 'warning' && 'bg-amber-50 border-amber-200 hover:border-amber-300',
      variant === 'info' && 'bg-blue-50 border-blue-200 hover:border-blue-300',
      size === 'lg' && 'p-6',
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          <p className={cn(
            'font-medium text-muted-foreground truncate',
            size === 'lg' ? 'text-sm' : 'text-xs',
          )}>{title}</p>
          <p className={cn(
            'font-bold tracking-tight truncate',
            size === 'lg' ? 'text-3xl' : 'text-2xl',
            variant === 'default' && 'text-foreground',
            variant === 'primary' && 'text-primary',
            variant === 'success' && 'text-emerald-700',
            variant === 'warning' && 'text-amber-700',
            variant === 'info' && 'text-blue-700',
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              'text-muted-foreground',
              size === 'lg' ? 'text-sm' : 'text-xs',
            )}>{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-semibold',
              trend === 'up' && 'text-emerald-600',
              trend === 'down' && 'text-red-600',
              trend === 'neutral' && 'text-muted-foreground',
            )}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trendValue}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'rounded-xl p-3 shrink-0',
            variant === 'default' && 'bg-muted',
            variant === 'primary' && 'bg-primary/10',
            variant === 'success' && 'bg-emerald-100',
            variant === 'warning' && 'bg-amber-100',
            variant === 'info' && 'bg-blue-100',
          )}>
            <Icon className={cn(
              size === 'lg' ? 'h-6 w-6' : 'h-5 w-5',
              variant === 'default' && 'text-muted-foreground',
              variant === 'primary' && 'text-primary',
              variant === 'success' && 'text-emerald-600',
              variant === 'warning' && 'text-amber-600',
              variant === 'info' && 'text-blue-600',
            )} />
          </div>
        )}
      </div>
    </div>
  )
}
