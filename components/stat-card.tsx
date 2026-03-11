import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  variant?: 'default' | 'primary' | 'success' | 'warning'
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
}: StatCardProps) {
  return (
    <div className={cn(
      'rounded-xl border p-5 transition-shadow hover:shadow-md',
      variant === 'default' && 'bg-card border-border',
      variant === 'primary' && 'bg-primary/5 border-primary/20',
      variant === 'success' && 'bg-emerald-50 border-emerald-200',
      variant === 'warning' && 'bg-amber-50 border-amber-200',
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn(
            'text-2xl font-bold tracking-tight',
            variant === 'default' && 'text-foreground',
            variant === 'primary' && 'text-primary',
            variant === 'success' && 'text-emerald-700',
            variant === 'warning' && 'text-amber-700',
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
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
            'rounded-lg p-2.5',
            variant === 'default' && 'bg-muted',
            variant === 'primary' && 'bg-primary/10',
            variant === 'success' && 'bg-emerald-100',
            variant === 'warning' && 'bg-amber-100',
          )}>
            <Icon className={cn(
              'h-5 w-5',
              variant === 'default' && 'text-muted-foreground',
              variant === 'primary' && 'text-primary',
              variant === 'success' && 'text-emerald-600',
              variant === 'warning' && 'text-amber-600',
            )} />
          </div>
        )}
      </div>
    </div>
  )
}
