// This file manages the order store across the app
// It provides access to both seeded orders and newly created orders

import type { Order } from '@/lib/types'
import { ORDERS as SEEDED_ORDERS } from '@/lib/mock-data'

// In-memory store for tracking all orders (seeded + newly created)
let allOrders: Order[] = [...SEEDED_ORDERS]

/**
 * Get all orders (seeded + newly created)
 */
export function getAllOrders(): Order[] {
  return allOrders
}

/**
 * Get a single order by ID
 */
export function getOrderById(id: string): Order | undefined {
  return allOrders.find(o => o.id === id)
}

/**
 * Add or update an order
 */
export function saveOrder(order: Order): void {
  const existingIndex = allOrders.findIndex(o => o.id === order.id)
  if (existingIndex !== -1) {
    allOrders[existingIndex] = order
  } else {
    allOrders.push(order)
  }
}

/**
 * Reset orders (for testing)
 */
export function resetOrders(): void {
  allOrders = [...SEEDED_ORDERS]
}
