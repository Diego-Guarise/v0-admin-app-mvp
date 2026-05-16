'use client'

/**
 * Dashboard Statistics Helper
 * Calculates REAL metrics from persisted stores (orders + expenses)
 * Supports single-month and date-range (multi-month) period filtering.
 */

import type { DashboardStats } from '@/lib/types'
import { getCreatedOrders } from '@/lib/order-store'
import { getExpenses } from '@/lib/expenses-store'

// ─── Period types ────────────────────────────────────────────────────────────

export type PeriodMode = 'this_month' | 'specific_month' | 'range'

export interface PeriodFilter {
  mode: PeriodMode
  /** YYYY-MM — used when mode = 'specific_month' */
  month?: string
  /** YYYY-MM — used when mode = 'range' */
  from?: string
  /** YYYY-MM — used when mode = 'range' */
  to?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns current month as YYYY-MM */
export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Resolves a PeriodFilter to an inclusive { from, to } range in YYYY-MM strings.
 */
export function getDateRangeForPeriod(period: PeriodFilter): { from: string; to: string } {
  const current = getCurrentMonth()
  switch (period.mode) {
    case 'this_month':
      return { from: current, to: current }
    case 'specific_month':
      return { from: period.month || current, to: period.month || current }
    case 'range':
      return {
        from: period.from || current,
        to: period.to || period.from || current,
      }
  }
}

/** Returns a human-readable label for the period */
export function getPeriodLabel(period: PeriodFilter): string {
  const fmt = (ym: string) => {
    const [year, month] = ym.split('-')
    return new Date(Number(year), Number(month) - 1).toLocaleString('es-UY', {
      month: 'long',
      year: 'numeric',
    })
  }
  switch (period.mode) {
    case 'this_month':
      return fmt(getCurrentMonth())
    case 'specific_month':
      return period.month ? fmt(period.month) : fmt(getCurrentMonth())
    case 'range': {
      const from = period.from || getCurrentMonth()
      const to = period.to || from
      if (from === to) return fmt(from)
      return `${fmt(from)} — ${fmt(to)}`
    }
  }
}

/**
 * Returns true if the order_date (YYYY-MM-DD) falls within the [fromMonth, toMonth] range (inclusive).
 */
function orderInRange(orderDate: string, fromMonth: string, toMonth: string): boolean {
  // Compare YYYY-MM prefix only
  const month = orderDate.slice(0, 7)
  return month >= fromMonth && month <= toMonth
}

/**
 * Returns true if the expense accounting_month (YYYY-MM) falls within range.
 */
function expenseInRange(accountingMonth: string, fromMonth: string, toMonth: string): boolean {
  return accountingMonth >= fromMonth && accountingMonth <= toMonth
}

// ─── Core stats function ─────────────────────────────────────────────────────

/**
 * Calculate real dashboard stats from actual persisted data.
 * Accepts a PeriodFilter; defaults to current month.
 *
 * Includes ONLY real created orders (no seeded/demo), status != 'anulado'.
 */
export function calculateRealDashboardStats(period?: PeriodFilter): DashboardStats {
  const activePeriod: PeriodFilter = period || { mode: 'this_month' }
  const { from, to } = getDateRangeForPeriod(activePeriod)

  let allOrders = []
  let allExpenses = []

  try {
    allOrders = getCreatedOrders() || []
  } catch {
    allOrders = []
  }

  try {
    allExpenses = getExpenses() || []
  } catch {
    allExpenses = []
  }

  // Active orders in range (not anulado)
  const activeOrders = allOrders.filter(
    o => o?.order_date && orderInRange(o.order_date, from, to) && o.status !== 'anulado'
  )

  // Active expenses in range
  const rangeExpenses = allExpenses.filter(
    e =>
      e?.accounting_month &&
      expenseInRange(e.accounting_month, from, to) &&
      e.status === 'activo'
  )

  const salesWithoutIva = activeOrders.reduce((sum, o) => sum + (o?.subtotal || 0), 0)
  const salesWithIva = activeOrders.reduce((sum, o) => sum + (o?.total || 0), 0)
  const expenses = rangeExpenses.reduce((sum, e) => sum + (e?.amount || 0), 0)
  const totalEnduido = activeOrders.reduce((sum, o) => sum + (o?.enduido_kg || 0), 0)
  const totalMasilla = activeOrders.reduce((sum, o) => sum + (o?.masilla_kg || 0), 0)

  return {
    monthly_sales_without_iva: salesWithoutIva,
    monthly_sales_with_iva: salesWithIva,
    monthly_expenses: expenses,
    enduido_kg_sold: totalEnduido,
    masilla_kg_sold: totalMasilla,
  }
}

/**
 * Get all real orders (status != anulado) within the given period.
 * Used for status counts and recent orders list.
 */
export function getAllRealOrdersInPeriod(period?: PeriodFilter) {
  const activePeriod: PeriodFilter = period || { mode: 'this_month' }
  const { from, to } = getDateRangeForPeriod(activePeriod)

  let allOrders = []
  try {
    allOrders = getCreatedOrders() || []
  } catch {
    allOrders = []
  }

  return allOrders.filter(
    o => o?.order_date && orderInRange(o.order_date, from, to) && o.status !== 'anulado'
  )
}

// Keep legacy exports for backward compat
export function getAllRealOrdersThisMonth(month?: string) {
  return getAllRealOrdersInPeriod(
    month ? { mode: 'specific_month', month } : { mode: 'this_month' }
  )
}

export function getDashboardMetrics(month?: string): DashboardStats {
  return calculateRealDashboardStats(
    month ? { mode: 'specific_month', month } : { mode: 'this_month' }
  )
}
