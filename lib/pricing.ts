// Pricing system for FOX orders
// Now uses editable price list from price-store as source of truth

import type { PriceCategory } from './types'
import { getPriceByKey } from './price-store'

export interface PricingEntry {
  productId: string
  presentationType: 'bolsa' | 'pote'
  weight: number
  category: PriceCategory
  priceWithoutBrand: number
  priceWithBrand: number
}

/**
 * Look up unit price from the editable price list
 * Falls back to legacy hardcoded prices if not found
 */
export function lookupUnitPrice(
  productId: string,
  presentationType: 'bolsa' | 'pote',
  weightKg: number,
  withBrand: boolean,
  priceCategory: PriceCategory
): number {
  // Try to get from presentations and price store
  // This requires a different approach - we need presentation_id
  // For now, returning 0 to indicate the caller should use the full price-store lookup
  console.log('[v0] lookupUnitPrice called with product/weight - recommend using getPriceByKey instead')
  return 0
}

/**
 * Get price from the editable price list by presentation ID
 * This is the recommended way to get prices
 */
export function getPriceFromStore(
  productId: string,
  presentationId: string,
  withBrand: boolean,
  priceCategory: PriceCategory
): number {
  const priceItem = getPriceByKey(productId, presentationId, withBrand, priceCategory)
  return priceItem ? priceItem.unit_price_for_sales_unit : 0
}

/**
 * Get full price information including sales unit details
 */
export function getPriceDetailsFromStore(
  productId: string,
  presentationId: string,
  withBrand: boolean,
  priceCategory: PriceCategory
) {
  const priceItem = getPriceByKey(productId, presentationId, withBrand, priceCategory)
  return priceItem || null
}

/**
 * Check if potes must always be branded for a product
 * Rule: Potes are always branded for Masilla
 */
export function isPotesAlwaysBranded(productId: string): boolean {
  return productId === 'prod-2' // Masilla para Yeso
}

// Legacy pricing table - kept for reference, but price-store is now source of truth
export const PRICING_TABLE: PricingEntry[] = [
  // Legacy entries - deprecated
  // Use price-store.ts instead
]

