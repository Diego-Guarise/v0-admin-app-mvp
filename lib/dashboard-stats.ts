'use client'

/**
 * Dashboard Statistics Helper
 * Calculates REAL metrics from persisted stores (orders + expenses)
 * - ONLY uses real created orders (no demo/seeded orders)
 * - Includes ALL orders with status != 'anulado' (in_produccion, finalizado, entregado)
 * - No mock data, no mixing with demo orders
 */

import type { DashboardStats } from '@/lib/types'
import { getCreatedOrders } from '@/lib/order-store'
import { getExpenses } from '@/lib/expenses-store'

/**
 * Get current month in YYYY-MM format
 */
function getCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Calculate real dashboard stats from actual persisted data ONLY
 * Commercial metrics (ventas, kilos) include:
 * - ONLY real created orders (no seeded/demo orders)
 * - ALL orders with status != 'anulado' (en_produccion, finalizado, entregado)
 * - Orders from current month
 * 
 * This reflects what's actually being entered in the system, not just what's closed.
 * 
 * @param month - Optional month in YYYY-MM format (defaults to current month)
 */
export function calculateRealDashboardStats(month?: string): DashboardStats {
  const targetMonth = month || getCurrentMonth()
  
  // Get ONLY real created orders (no seeded demo orders)
  let allOrders = []
  let allExpenses = []
  
  try {
    allOrders = getCreatedOrders() || []
    console.log('[v0] Loaded REAL orders from store:', allOrders.length)
  } catch (error) {
    console.error('[v0] Error fetching orders:', error)
    allOrders = []
  }
  
  try {
    allExpenses = getExpenses() || []
    console.log('[v0] Loaded expenses from store:', allExpenses.length)
  } catch (error) {
    console.error('[v0] Error fetching expenses:', error)
    allExpenses = []
  }
  
  // NEW RULE: Count ALL real orders that are NOT cancelled (anulado)
  // This includes: en_produccion, finalizado, entregado
  const activeOrdersThisMonth = allOrders.filter(o => 
    o && 
    o.order_date && 
    o.order_date.startsWith(targetMonth) && 
    o.status !== 'anulado'
  )
  
  console.log(`[v0] Real orders in ${targetMonth}:`, {
    total: allOrders.filter(o => o?.order_date?.startsWith(targetMonth)).length,
    active_not_cancelled: activeOrdersThisMonth.length,
    by_status: {
      en_produccion: allOrders.filter(o => o?.order_date?.startsWith(targetMonth) && o.status === 'en_produccion').length,
      finalizado: allOrders.filter(o => o?.order_date?.startsWith(targetMonth) && o.status === 'finalizado').length,
      entregado: allOrders.filter(o => o?.order_date?.startsWith(targetMonth) && o.status === 'entregado').length,
      anulado: allOrders.filter(o => o?.order_date?.startsWith(targetMonth) && o.status === 'anulado').length,
    }
  })
  
  // Filter expenses for the target month, only active ones
  const monthExpenses = allExpenses.filter(e => 
    e && 
    e.accounting_month && 
    e.accounting_month === targetMonth && 
    e.status === 'activo'
  )
  
  // Calculate total product weights by type (from ALL non-cancelled orders)
  let totalEnduido = 0
  let totalMasilla = 0
  
  activeOrdersThisMonth.forEach(order => {
    // Validate order and items exist
    if (!order || !Array.isArray(order.items) || order.items.length === 0) {
      return
    }
    
    console.log(`[v0] Processing real order ${order.id} (status: ${order.status}):`, {
      items: order.items.length,
    })
    
    // Sum product weights by their type
    order.items.forEach(item => {
      // Validate item structure
      if (!item) {
        return
      }
      
      // Get quantity (with fallback)
      const quantity = item.quantity || 0
      if (quantity === 0) return
      
      // Get weight_per_unit_kg (with fallback and debugging)
      const weightPerUnit = item.weight_per_unit_kg || 0
      
      const itemTotalKg = quantity * weightPerUnit
      
      // Determine product type based on product_id
      // prod-1 = Enduido, prod-2 = Masilla
      if (item.product_id === 'prod-1') {
        totalEnduido += itemTotalKg
        console.log(`[v0] Enduido: +${itemTotalKg} kg (qty: ${quantity}, weight: ${weightPerUnit})`)
      } else if (item.product_id === 'prod-2') {
        totalMasilla += itemTotalKg
        console.log(`[v0] Masilla: +${itemTotalKg} kg (qty: ${quantity}, weight: ${weightPerUnit})`)
      }
    })
  })
  
  const salesWithoutIva = activeOrdersThisMonth.reduce((sum, o) => sum + (o?.subtotal || 0), 0)
  const salesWithIva = activeOrdersThisMonth.reduce((sum, o) => sum + (o?.total || 0), 0)
  const expenses = monthExpenses.reduce((sum, e) => sum + (e?.amount || 0), 0)
  
  console.log(`[v0] Dashboard stats for ${targetMonth} (REAL DATA ONLY):`, {
    sales_without_iva: salesWithoutIva,
    sales_with_iva: salesWithIva,
    enduido_kg: totalEnduido,
    masilla_kg: totalMasilla,
    expenses: expenses,
  })
  
  return {
    monthly_sales_without_iva: salesWithoutIva,
    monthly_sales_with_iva: salesWithIva,
    monthly_expenses: expenses,
    enduido_kg_sold: totalEnduido,
    masilla_kg_sold: totalMasilla,
  }
}

/**
 * Get ALL REAL orders (any status except anulado) for current month
 * Used by dashboard to show order status counts
 * Returns ONLY real created orders, not seeded demo orders
 */
export function getAllRealOrdersThisMonth(month?: string) {
  const targetMonth = month || getCurrentMonth()
  
  let allOrders = []
  try {
    allOrders = getCreatedOrders() || []
  } catch (error) {
    console.error('[v0] Error fetching real orders for status counts:', error)
  }
  
  return allOrders.filter(o => 
    o && 
    o.order_date && 
    o.order_date.startsWith(targetMonth) &&
    o.status !== 'anulado'
  )
}

/**
 * Get dashboard stats with memoization support for React
 */
export function getDashboardMetrics(month?: string): DashboardStats {
  return calculateRealDashboardStats(month)
}


