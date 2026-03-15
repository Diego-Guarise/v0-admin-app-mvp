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
 * Get price from the editable price list by presentation ID (RECOMMENDED)
 * This is the primary way to get prices - directly from price store
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
 * This is the primary method to use for complete price information
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
 * DEPRECATED: Use getPriceDetailsFromStore() instead.
 * This was a legacy lookup method that didn't work with the new price store structure.
 * It now serves as a wrapper that logs a warning (for backward compatibility only).
 */
export function lookupUnitPrice(
  productId: string,
  presentationType: 'bolsa' | 'pote',
  weightKg: number,
  withBrand: boolean,
  priceCategory: PriceCategory
): number {
  console.warn('[v0] lookupUnitPrice() is deprecated. Use getPriceDetailsFromStore() with presentation_id instead.')
  return 0
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

