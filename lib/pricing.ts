// Pricing system for FOX orders - SIMPLIFIED
// Maps product + presentation + category (without marca) to base prices
// Brand markup is handled by the marca toggle on each order item

import type { PriceCategory } from './types'

export interface PricingEntry {
  productId: string
  presentationType: 'bolsa' | 'pote'
  weight: number
  category: PriceCategory
  priceWithoutBrand: number
  priceWithBrand: number  // Price when marca=true
}

// Simplified pricing table
// Now: each entry has both branded and non-branded prices
// Potes don't have non-branded entries (always branded)
export const PRICING_TABLE: PricingEntry[] = [
  // ===== ENDUIDO INTERIOR - BOLSAS =====
  { productId: 'prod-1', presentationType: 'bolsa', weight: 1, category: 'barraca', priceWithoutBrand: 25, priceWithBrand: 30 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 1, category: 'distribuidor', priceWithoutBrand: 22, priceWithBrand: 28 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 1, category: 'oferta', priceWithoutBrand: 20, priceWithBrand: 25 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 1, category: 'consumidor_final', priceWithoutBrand: 35, priceWithBrand: 40 },
  
  { productId: 'prod-1', presentationType: 'bolsa', weight: 2, category: 'barraca', priceWithoutBrand: 45, priceWithBrand: 52 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 2, category: 'distribuidor', priceWithoutBrand: 40, priceWithBrand: 48 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 2, category: 'oferta', priceWithoutBrand: 36, priceWithBrand: 43 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 2, category: 'consumidor_final', priceWithoutBrand: 62, priceWithBrand: 72 },
  
  { productId: 'prod-1', presentationType: 'bolsa', weight: 5, category: 'barraca', priceWithoutBrand: 85, priceWithBrand: 98 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 5, category: 'distribuidor', priceWithoutBrand: 75, priceWithBrand: 88 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 5, category: 'oferta', priceWithoutBrand: 68, priceWithBrand: 80 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 5, category: 'consumidor_final', priceWithoutBrand: 115, priceWithBrand: 132 },
  
  { productId: 'prod-1', presentationType: 'bolsa', weight: 10, category: 'barraca', priceWithoutBrand: 155, priceWithBrand: 175 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 10, category: 'distribuidor', priceWithoutBrand: 138, priceWithBrand: 158 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 10, category: 'oferta', priceWithoutBrand: 125, priceWithBrand: 145 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 10, category: 'consumidor_final', priceWithoutBrand: 210, priceWithBrand: 240 },
  
  { productId: 'prod-1', presentationType: 'bolsa', weight: 20, category: 'barraca', priceWithoutBrand: 290, priceWithBrand: 330 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 20, category: 'distribuidor', priceWithoutBrand: 260, priceWithBrand: 300 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 20, category: 'oferta', priceWithoutBrand: 235, priceWithBrand: 275 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 20, category: 'consumidor_final', priceWithoutBrand: 395, priceWithBrand: 450 },
  
  // ===== MASILLA PARA YESO - BOLSAS =====
  { productId: 'prod-2', presentationType: 'bolsa', weight: 1, category: 'barraca', priceWithoutBrand: 22, priceWithBrand: 28 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 1, category: 'distribuidor', priceWithoutBrand: 20, priceWithBrand: 26 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 1, category: 'oferta', priceWithoutBrand: 18, priceWithBrand: 23 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 1, category: 'consumidor_final', priceWithoutBrand: 32, priceWithBrand: 38 },
  
  { productId: 'prod-2', presentationType: 'bolsa', weight: 2, category: 'barraca', priceWithoutBrand: 40, priceWithBrand: 48 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 2, category: 'distribuidor', priceWithoutBrand: 36, priceWithBrand: 44 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 2, category: 'oferta', priceWithoutBrand: 32, priceWithBrand: 40 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 2, category: 'consumidor_final', priceWithoutBrand: 56, priceWithBrand: 66 },
  
  { productId: 'prod-2', presentationType: 'bolsa', weight: 5, category: 'barraca', priceWithoutBrand: 78, priceWithBrand: 92 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 5, category: 'distribuidor', priceWithoutBrand: 70, priceWithBrand: 84 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 5, category: 'oferta', priceWithoutBrand: 62, priceWithBrand: 76 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 5, category: 'consumidor_final', priceWithoutBrand: 105, priceWithBrand: 125 },
  
  { productId: 'prod-2', presentationType: 'bolsa', weight: 10, category: 'barraca', priceWithoutBrand: 140, priceWithBrand: 162 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 10, category: 'distribuidor', priceWithoutBrand: 125, priceWithBrand: 147 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 10, category: 'oferta', priceWithoutBrand: 112, priceWithBrand: 135 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 10, category: 'consumidor_final', priceWithoutBrand: 190, priceWithBrand: 225 },
  
  { productId: 'prod-2', presentationType: 'bolsa', weight: 20, category: 'barraca', priceWithoutBrand: 260, priceWithBrand: 304 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 20, category: 'distribuidor', priceWithoutBrand: 234, priceWithBrand: 278 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 20, category: 'oferta', priceWithoutBrand: 210, priceWithBrand: 255 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 20, category: 'consumidor_final', priceWithoutBrand: 360, priceWithBrand: 425 },
  
  // ===== MASILLA PARA YESO - POTES (Always branded, so only priceWithBrand used) =====
  { productId: 'prod-2', presentationType: 'pote', weight: 1.7, category: 'barraca', priceWithoutBrand: 0, priceWithBrand: 55 },
  { productId: 'prod-2', presentationType: 'pote', weight: 1.7, category: 'distribuidor', priceWithoutBrand: 0, priceWithBrand: 48 },
  { productId: 'prod-2', presentationType: 'pote', weight: 1.7, category: 'oferta', priceWithoutBrand: 0, priceWithBrand: 42 },
  { productId: 'prod-2', presentationType: 'pote', weight: 1.7, category: 'consumidor_final', priceWithoutBrand: 0, priceWithBrand: 75 },
  
  { productId: 'prod-2', presentationType: 'pote', weight: 7, category: 'barraca', priceWithoutBrand: 0, priceWithBrand: 165 },
  { productId: 'prod-2', presentationType: 'pote', weight: 7, category: 'distribuidor', priceWithoutBrand: 0, priceWithBrand: 148 },
  { productId: 'prod-2', presentationType: 'pote', weight: 7, category: 'oferta', priceWithoutBrand: 0, priceWithBrand: 130 },
  { productId: 'prod-2', presentationType: 'pote', weight: 7, category: 'consumidor_final', priceWithoutBrand: 0, priceWithBrand: 225 },
  
  { productId: 'prod-2', presentationType: 'pote', weight: 18, category: 'barraca', priceWithoutBrand: 0, priceWithBrand: 395 },
  { productId: 'prod-2', presentationType: 'pote', weight: 18, category: 'distribuidor', priceWithoutBrand: 0, priceWithBrand: 360 },
  { productId: 'prod-2', presentationType: 'pote', weight: 18, category: 'oferta', priceWithoutBrand: 0, priceWithBrand: 318 },
  { productId: 'prod-2', presentationType: 'pote', weight: 18, category: 'consumidor_final', priceWithoutBrand: 0, priceWithBrand: 540 },
]

/**
 * Look up unit price for a product/presentation combination
 * Now uses simplified category (no marca variants) + marca field
 */
export function lookupUnitPrice(
  productId: string,
  presentationType: 'bolsa' | 'pote',
  weightKg: number,
  withBrand: boolean,
  priceCategory: PriceCategory
): number {
  const entry = PRICING_TABLE.find(p =>
    p.productId === productId &&
    p.presentationType === presentationType &&
    p.weight === weightKg &&
    p.category === priceCategory
  )
  
  if (!entry) return 0
  
  // Return appropriate price based on marca flag
  return withBrand ? entry.priceWithBrand : entry.priceWithoutBrand
}

/**
 * Check if potes must always be branded for a product
 * Rule: Potes are always branded for Masilla
 */
export function isPotesAlwaysBranded(productId: string): boolean {
  return productId === 'prod-2' // Masilla para Yeso
}
