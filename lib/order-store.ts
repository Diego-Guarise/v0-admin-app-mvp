// This file manages the order store across the app
// It provides access to both seeded orders and newly created orders
// Uses browser localStorage to persist newly created orders across page reloads

import type { Order } from '@/lib/types'
import { ORDERS as SEEDED_ORDERS } from '@/lib/mock-data'

const STORAGE_KEY = 'app_created_orders'

/**
 * Get newly created orders from localStorage
 */
function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') {
    // Server-side: return empty array, client will have the data
    return []
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save newly created orders to localStorage
 */
function saveStoredOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Get ONLY newly created orders (no seeded demo orders)
 * Use this for dashboards and reports that need real data only
 */
export function getCreatedOrders(): Order[] {
  return getStoredOrders()
}

/**
 * Get all orders (seeded + newly created/updated from localStorage).
 * Stored orders (including status updates) override seeds with the same id.
 * For dashboards needing only real data, use getCreatedOrders() instead.
 */
export function getAllOrders(): Order[] {
  const storedOrders = getStoredOrders()
  const storedIds = new Set(storedOrders.map(o => o.id))
  const seedsNotOverridden = SEEDED_ORDERS.filter(o => !storedIds.has(o.id))
  return [...seedsNotOverridden, ...storedOrders]
}

/**
 * Get a single order by ID
 */
export function getOrderById(id: string): Order | undefined {
  return getAllOrders().find(o => o.id === id)
}

/**
 * Add or update an order
 */
export function saveOrder(order: Order): void {
  const createdOrders = getStoredOrders()
  const existingIndex = createdOrders.findIndex(o => o.id === order.id)
  
  if (existingIndex !== -1) {
    createdOrders[existingIndex] = order
  } else {
    createdOrders.push(order)
  }
  
  saveStoredOrders(createdOrders)
}

/**
 * Reset orders (for testing)
 */
export function resetOrders(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}
