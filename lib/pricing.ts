// Pricing system for FOX orders
// Maps product + presentation + brand + price_category to unit prices

import type { Product, Presentation, PriceCategory } from './types'

export interface PricingEntry {
  productId: string
  presentationType: 'bolsa' | 'pote'
  weight: number
  withBrand: boolean
  category: PriceCategory
  unitPrice: number
}

// Pricing table - seeded with realistic values
// Structure: Each product/presentation combination has prices for each category
export const PRICING_TABLE: PricingEntry[] = [
  // ===== ENDUIDO INTERIOR - BOLSAS =====
  // 1 kg
  { productId: 'prod-1', presentationType: 'bolsa', weight: 1, withBrand: false, category: 'barraca', unitPrice: 25 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 1, withBrand: true, category: 'barraca_marca', unitPrice: 30 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 1, withBrand: false, category: 'distribuidor', unitPrice: 22 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 1, withBrand: true, category: 'distribuidor_marca', unitPrice: 28 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 1, withBrand: false, category: 'oferta', unitPrice: 20 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 1, withBrand: false, category: 'consumidor_final', unitPrice: 35 },
  
  // 2 kg
  { productId: 'prod-1', presentationType: 'bolsa', weight: 2, withBrand: false, category: 'barraca', unitPrice: 45 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 2, withBrand: true, category: 'barraca_marca', unitPrice: 52 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 2, withBrand: false, category: 'distribuidor', unitPrice: 40 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 2, withBrand: true, category: 'distribuidor_marca', unitPrice: 48 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 2, withBrand: false, category: 'oferta', unitPrice: 36 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 2, withBrand: false, category: 'consumidor_final', unitPrice: 62 },
  
  // 5 kg
  { productId: 'prod-1', presentationType: 'bolsa', weight: 5, withBrand: false, category: 'barraca', unitPrice: 85 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 5, withBrand: true, category: 'barraca_marca', unitPrice: 98 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 5, withBrand: false, category: 'distribuidor', unitPrice: 75 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 5, withBrand: true, category: 'distribuidor_marca', unitPrice: 88 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 5, withBrand: false, category: 'oferta', unitPrice: 68 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 5, withBrand: false, category: 'consumidor_final', unitPrice: 115 },
  
  // 10 kg
  { productId: 'prod-1', presentationType: 'bolsa', weight: 10, withBrand: false, category: 'barraca', unitPrice: 155 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 10, withBrand: true, category: 'barraca_marca', unitPrice: 175 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 10, withBrand: false, category: 'distribuidor', unitPrice: 138 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 10, withBrand: true, category: 'distribuidor_marca', unitPrice: 158 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 10, withBrand: false, category: 'oferta', unitPrice: 125 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 10, withBrand: false, category: 'consumidor_final', unitPrice: 210 },
  
  // 20 kg
  { productId: 'prod-1', presentationType: 'bolsa', weight: 20, withBrand: false, category: 'barraca', unitPrice: 290 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 20, withBrand: true, category: 'barraca_marca', unitPrice: 330 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 20, withBrand: false, category: 'distribuidor', unitPrice: 260 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 20, withBrand: true, category: 'distribuidor_marca', unitPrice: 300 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 20, withBrand: false, category: 'oferta', unitPrice: 235 },
  { productId: 'prod-1', presentationType: 'bolsa', weight: 20, withBrand: false, category: 'consumidor_final', unitPrice: 395 },
  
  // ===== MASILLA PARA YESO - BOLSAS =====
  // 1 kg
  { productId: 'prod-2', presentationType: 'bolsa', weight: 1, withBrand: false, category: 'barraca', unitPrice: 22 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 1, withBrand: true, category: 'barraca_marca', unitPrice: 28 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 1, withBrand: false, category: 'distribuidor', unitPrice: 20 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 1, withBrand: true, category: 'distribuidor_marca', unitPrice: 26 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 1, withBrand: false, category: 'oferta', unitPrice: 18 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 1, withBrand: false, category: 'consumidor_final', unitPrice: 32 },
  
  // 2 kg
  { productId: 'prod-2', presentationType: 'bolsa', weight: 2, withBrand: false, category: 'barraca', unitPrice: 40 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 2, withBrand: true, category: 'barraca_marca', unitPrice: 48 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 2, withBrand: false, category: 'distribuidor', unitPrice: 36 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 2, withBrand: true, category: 'distribuidor_marca', unitPrice: 44 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 2, withBrand: false, category: 'oferta', unitPrice: 32 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 2, withBrand: false, category: 'consumidor_final', unitPrice: 56 },
  
  // 5 kg
  { productId: 'prod-2', presentationType: 'bolsa', weight: 5, withBrand: false, category: 'barraca', unitPrice: 78 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 5, withBrand: true, category: 'barraca_marca', unitPrice: 92 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 5, withBrand: false, category: 'distribuidor', unitPrice: 70 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 5, withBrand: true, category: 'distribuidor_marca', unitPrice: 84 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 5, withBrand: false, category: 'oferta', unitPrice: 62 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 5, withBrand: false, category: 'consumidor_final', unitPrice: 105 },
  
  // 10 kg
  { productId: 'prod-2', presentationType: 'bolsa', weight: 10, withBrand: false, category: 'barraca', unitPrice: 140 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 10, withBrand: true, category: 'barraca_marca', unitPrice: 162 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 10, withBrand: false, category: 'distribuidor', unitPrice: 125 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 10, withBrand: true, category: 'distribuidor_marca', unitPrice: 147 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 10, withBrand: false, category: 'oferta', unitPrice: 112 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 10, withBrand: false, category: 'consumidor_final', unitPrice: 190 },
  
  // 20 kg
  { productId: 'prod-2', presentationType: 'bolsa', weight: 20, withBrand: false, category: 'barraca', unitPrice: 260 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 20, withBrand: true, category: 'barraca_marca', unitPrice: 304 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 20, withBrand: false, category: 'distribuidor', unitPrice: 234 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 20, withBrand: true, category: 'distribuidor_marca', unitPrice: 278 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 20, withBrand: false, category: 'oferta', unitPrice: 210 },
  { productId: 'prod-2', presentationType: 'bolsa', weight: 20, withBrand: false, category: 'consumidor_final', unitPrice: 360 },
  
  // ===== MASILLA PARA YESO - POTES (Always branded) =====
  // 1.7 kg - Always treated as branded
  { productId: 'prod-2', presentationType: 'pote', weight: 1.7, withBrand: true, category: 'barraca_marca', unitPrice: 55 },
  { productId: 'prod-2', presentationType: 'pote', weight: 1.7, withBrand: true, category: 'distribuidor_marca', unitPrice: 48 },
  { productId: 'prod-2', presentationType: 'pote', weight: 1.7, withBrand: true, category: 'oferta', unitPrice: 42 },
  { productId: 'prod-2', presentationType: 'pote', weight: 1.7, withBrand: true, category: 'consumidor_final', unitPrice: 75 },
  
  // 7 kg
  { productId: 'prod-2', presentationType: 'pote', weight: 7, withBrand: true, category: 'barraca_marca', unitPrice: 165 },
  { productId: 'prod-2', presentationType: 'pote', weight: 7, withBrand: true, category: 'distribuidor_marca', unitPrice: 148 },
  { productId: 'prod-2', presentationType: 'pote', weight: 7, withBrand: true, category: 'oferta', unitPrice: 130 },
  { productId: 'prod-2', presentationType: 'pote', weight: 7, withBrand: true, category: 'consumidor_final', unitPrice: 225 },
  
  // 18 kg
  { productId: 'prod-2', presentationType: 'pote', weight: 18, withBrand: true, category: 'barraca_marca', unitPrice: 395 },
  { productId: 'prod-2', presentationType: 'pote', weight: 18, withBrand: true, category: 'distribuidor_marca', unitPrice: 360 },
  { productId: 'prod-2', presentationType: 'pote', weight: 18, withBrand: true, category: 'oferta', unitPrice: 318 },
  { productId: 'prod-2', presentationType: 'pote', weight: 18, withBrand: true, category: 'consumidor_final', unitPrice: 540 },
]

/**
 * Look up unit price for a product/presentation combination
 * @param productId - The product ID
 * @param presentationType - 'bolsa' or 'pote'
 * @param weightKg - The weight in kg
 * @param withBrand - Whether the presentation has branding
 * @param priceCategory - The price category
 * @returns The unit price, or 0 if not found
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
    p.withBrand === withBrand &&
    p.category === priceCategory
  )
  return entry?.unitPrice || 0
}

/**
 * Check if potes must always be branded for a product
 * Rule: Potes are always branded for Masilla
 */
export function isPotesAlwaysBranded(productId: string): boolean {
  return productId === 'prod-2' // Masilla para Yeso
}
