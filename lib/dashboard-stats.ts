'use client'

/**
 * Dashboard Statistics Helper
 * Calculates REAL metrics from persisted stores (orders + expenses)
 * - ONLY pedidos with status: 'finalizado' or 'entregado' count toward commercial metrics
 * - No mock data, no mixing with demo orders
 */

import type { DashboardStats } from '@/lib/types'
import { getAllOrders } from '@/lib/order-store'
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
 * Calculate real dashboard stats from actual persisted data
 * Commercial metrics (ventas, kilos) ONLY include:
 * - Orders with status 'finalizado' or 'entregado'
 * - Orders not cancelled ('anulado')
 * - Orders from current month
 * 
 * @param month - Optional month in YYYY-MM format (defaults to current month)
 */
export function calculateRealDashboardStats(month?: string): DashboardStats {
  const targetMonth = month || getCurrentMonth()
  
  // Get all real orders and expenses from persistent stores
  let allOrders = []
  let allExpenses = []
  
  try {
    allOrders = getAllOrders() || []
    console.log('[v0] Loaded orders from store:', allOrders.length)
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
  
  // CRITICAL: Filter for CLOSED orders only (finalizado or entregado)
  // Only these count toward commercial metrics
  const closedOrdersThisMonth = allOrders.filter(o => 
    o && 
    o.order_date && 
    o.order_date.startsWith(targetMonth) && 
    (o.status === 'finalizado' || o.status === 'entregado')
  )
  
  console.log(`[v0] Orders in ${targetMonth}:`, {
    total: allOrders.filter(o => o?.order_date?.startsWith(targetMonth)).length,
    closed: closedOrdersThisMonth.length,
  })
  
  // Filter expenses for the target month, only active ones
  const monthExpenses = allExpenses.filter(e => 
    e && 
    e.accounting_month && 
    e.accounting_month === targetMonth && 
    e.status === 'activo'
  )
  
  // Calculate total product weights by type (ONLY from closed orders)
  let totalEnduido = 0
  let totalMasilla = 0
  
  closedOrdersThisMonth.forEach(order => {
    // Validate order and items exist
    if (!order || !Array.isArray(order.items) || order.items.length === 0) {
      return
    }
    
    console.log(`[v0] Processing order ${order.id}:`, {
      status: order.status,
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
      if (weightPerUnit === 0) {
        console.log(`[v0] Item ${item.presentation_id} has no weight (weight_per_unit_kg: ${item.weight_per_unit_kg})`)
      }
      
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
  
  console.log(`[v0] Dashboard stats for ${targetMonth}:`, {
    sales_without_iva: closedOrdersThisMonth.reduce((sum, o) => sum + (o?.subtotal || 0), 0),
    sales_with_iva: closedOrdersThisMonth.reduce((sum, o) => sum + (o?.total || 0), 0),
    enduido_kg: totalEnduido,
    masilla_kg: totalMasilla,
    expenses: monthExpenses.reduce((sum, e) => sum + (e?.amount || 0), 0),
  })
  
  return {
    monthly_sales_without_iva: closedOrdersThisMonth.reduce((sum, o) => sum + (o?.subtotal || 0), 0),
    monthly_sales_with_iva: closedOrdersThisMonth.reduce((sum, o) => sum + (o?.total || 0), 0),
    monthly_expenses: monthExpenses.reduce((sum, e) => sum + (e?.amount || 0), 0),
    enduido_kg_sold: totalEnduido,
    masilla_kg_sold: totalMasilla,
  }
}

/**
 * Get ALL orders (any status) for current month
 * Used by dashboard to show order status counts
 */
export function getAllOrdersThisMonth(month?: string) {
  const targetMonth = month || getCurrentMonth()
  
  let allOrders = []
  try {
    allOrders = getAllOrders() || []
  } catch (error) {
    console.error('[v0] Error fetching orders for status counts:', error)
  }
  
  return allOrders.filter(o => o && o.order_date && o.order_date.startsWith(targetMonth))
}

/**
 * Get dashboard stats with memoization support for React
 */
export function getDashboardMetrics(month?: string): DashboardStats {
  return calculateRealDashboardStats(month)
}


