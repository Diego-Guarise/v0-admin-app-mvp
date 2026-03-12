'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ShoppingCart, Users, Receipt, Package, DollarSign } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/productos', label: 'Productos', icon: Package },
  { href: '/costos', label: 'Costos', icon: DollarSign },
  { href: '/gastos', label: 'Gastos', icon: Receipt },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Top Header - Desktop */}
      <header className="hidden lg:flex h-16 border-b border-border bg-card items-center justify-between px-6 shadow-sm">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <span className="text-primary-foreground font-bold text-lg tracking-tight">F</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">FOX Admin</h1>
            <p className="text-xs text-muted-foreground">Sistema de Gestión</p>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className={cn('h-4 w-4', active && 'stroke-[2.5]')} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden flex h-14 border-b border-border bg-card items-center justify-center px-4 shadow-sm">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-sm">F</span>
          </div>
          <h1 className="text-base font-semibold text-foreground tracking-tight">FOX Admin</h1>
        </Link>
      </header>

      {/* Main Content */}
      <main className="lg:py-2">
        {children}
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 z-50 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-full h-full text-xs font-medium transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground active:text-foreground'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-10 h-7 rounded-lg transition-colors',
                active && 'bg-primary/10'
              )}>
                <Icon className={cn(
                  'h-5 w-5',
                  active && 'stroke-[2.5]'
                )} />
              </div>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
