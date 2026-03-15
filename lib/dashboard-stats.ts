'use client'

/**
 * Dashboard Statistics Helper
 * Calculates real metrics from persisted stores (orders + expenses)
 * Not using mock data - connects to actual localStorage data
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
 * @param month - Optional month in YYYY-MM format (defaults to current month)
 */
export function calculateRealDashboardStats(month?: string): DashboardStats {
  const targetMonth = month || getCurrentMonth()
  
  // Get all real orders and expenses from persistent stores
  // Safely default to empty arrays if stores fail
  let allOrders = []
  let allExpenses = []
  
  try {
    allOrders = getAllOrders() || []
  } catch (error) {
    console.error('[v0] Error fetching orders:', error)
    allOrders = []
  }
  
  try {
    allExpenses = getExpenses() || []
  } catch (error) {
    console.error('[v0] Error fetching expenses:', error)
    allExpenses = []
  }
  
  // Filter orders for the target month, excluding cancelled orders
  const monthOrders = allOrders.filter(o => 
    o && 
    o.order_date && 
    o.order_date.startsWith(targetMonth) && 
    o.status !== 'anulado'
  )
  
  // Filter expenses for the target month, only active ones
  const monthExpenses = allExpenses.filter(e => 
    e && 
    e.accounting_month && 
    e.accounting_month === targetMonth && 
    e.status === 'activo'
  )
  
  // Calculate total product weights by type
  let totalEnduido = 0
  let totalMasilla = 0
  
  // Safe iteration through orders
  monthOrders.forEach(order => {
    // Validate order and items exist
    if (!order || !Array.isArray(order.items)) {
      return
    }
    
    // Sum product weights by their type
    order.items.forEach(item => {
      // Validate item structure
      if (!item || typeof item.quantity !== 'number') {
        return
      }
      
      // Get weight_per_unit_kg, default to 0 if missing
      const weightPerUnit = item.weight_per_unit_kg || 0
      const itemTotalKg = item.quantity * weightPerUnit
      
      // Determine product type based on product_id
      // prod-1 = Enduido, prod-2 = Masilla
      if (item.product_id === 'prod-1') {
        totalEnduido += itemTotalKg
      } else if (item.product_id === 'prod-2') {
        totalMasilla += itemTotalKg
      }
    })
  })
  
  return {
    monthly_sales_without_iva: monthOrders.reduce((sum, o) => sum + (o?.subtotal || 0), 0),
    monthly_sales_with_iva: monthOrders.reduce((sum, o) => sum + (o?.total || 0), 0),
    monthly_expenses: monthExpenses.reduce((sum, e) => sum + (e?.amount || 0), 0),
    enduido_kg_sold: totalEnduido,
    masilla_kg_sold: totalMasilla,
  }
}

/**
 * Get dashboard stats with memoization support for React
 * This function can be called from both server and client components
 */
export function getDashboardMetrics(month?: string): DashboardStats {
  return calculateRealDashboardStats(month)
}

