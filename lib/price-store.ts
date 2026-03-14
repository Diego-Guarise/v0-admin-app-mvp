import type { PriceListItem, PriceCategory } from './types'
import { PRODUCTS, PRESENTATIONS } from './mock-data'

const PRICE_STORE_KEY = 'fox-prices'

/**
 * Get all prices from localStorage, merged with seeded defaults
 */
export function getAllPrices(): PriceListItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(PRICE_STORE_KEY)
    if (stored) {
      const prices = JSON.parse(stored) as PriceListItem[]
      return prices
    }
  } catch (error) {
    console.error('[v0] Error reading price store:', error)
  }
  
  // Return seeded default prices
  return getSeedPrices()
}

/**
 * Get a specific price by product, presentation, brand, and category
 */
export function getPriceByKey(
  productId: string,
  presentationId: string,
  withBrand: boolean,
  priceCategory: PriceCategory
): PriceListItem | null {
  const allPrices = getAllPrices()
  return allPrices.find(p =>
    p.product_id === productId &&
    p.presentation_id === presentationId &&
    p.with_brand === withBrand &&
    p.price_category === priceCategory
  ) || null
}

/**
 * Save a price (create or update)
 */
export function savePrice(price: PriceListItem): void {
  if (typeof window === 'undefined') return
  
  try {
    const allPrices = getAllPrices()
    const existingIndex = allPrices.findIndex(p => p.id === price.id)
    
    if (existingIndex >= 0) {
      allPrices[existingIndex] = {
        ...price,
        updated_at: new Date().toISOString(),
      }
    } else {
      allPrices.push({
        ...price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
    
    localStorage.setItem(PRICE_STORE_KEY, JSON.stringify(allPrices))
    console.log('[v0] Price saved:', price.id)
  } catch (error) {
    console.error('[v0] Error saving price:', error)
  }
}

/**
 * Save multiple prices (batch update)
 */
export function savePrices(prices: PriceListItem[]): void {
  if (typeof window === 'undefined') return
  
  try {
    const now = new Date().toISOString()
    const updatedPrices = prices.map(p => ({
      ...p,
      updated_at: now,
    }))
    
    localStorage.setItem(PRICE_STORE_KEY, JSON.stringify(updatedPrices))
    console.log('[v0] Prices saved:', updatedPrices.length)
  } catch (error) {
    console.error('[v0] Error saving prices:', error)
  }
}

/**
 * Reset prices to defaults (delete localStorage entry)
 */
export function resetPrices(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(PRICE_STORE_KEY)
    console.log('[v0] Prices reset to defaults')
  } catch (error) {
    console.error('[v0] Error resetting prices:', error)
  }
}

/**
 * Generate seeded default prices from current pricing table
 */
function getSeedPrices(): PriceListItem[] {
  const prices: PriceListItem[] = []
  let id = 1

  // Get Enduido and Masilla products
  const enduido = PRODUCTS.find(p => p.id === 'prod-1')
  const masilla = PRODUCTS.find(p => p.id === 'prod-2')

  if (!enduido || !masilla) return prices

  const categories: PriceCategory[] = ['barraca', 'distribuidor', 'oferta', 'consumidor_final']
  const brands = [false, true]

  // Helper to create price item
  const createPrice = (
    product: typeof enduido,
    presentation: typeof PRESENTATIONS[0],
    withBrand: boolean,
    category: PriceCategory,
    unitPrice: number,
    salesUnitType: 'unidad' | 'funda' = 'unidad',
    unitsPerSalesUnit: number = 1
  ): PriceListItem => {
    const totalWeight = presentation.weight_kg * unitsPerSalesUnit
    
    return {
      id: `price-${id++}`,
      product_id: product.id,
      presentation_id: presentation.id,
      with_brand: withBrand,
      price_category: category,
      sales_unit_type: salesUnitType,
      units_per_sales_unit: unitsPerSalesUnit,
      weight_per_unit_kg: presentation.weight_kg,
      total_weight_per_sales_unit_kg: totalWeight,
      unit_price_for_sales_unit: unitPrice,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  // ===== ENDUIDO - Bolsa 1kg =====
  const end1kg = PRESENTATIONS.find(p => p.product_id === 'prod-1' && p.weight_kg === 1 && p.type === 'bolsa' && p.with_brand === true)
  if (end1kg) {
    // Sold by funda (20 units = 20 kg)
    // Restricted for consumidor_final category
    categories.forEach(cat => {
      if (cat === 'consumidor_final') return // Skip this category
      brands.forEach(brand => {
        const basePrice = brand ? 30 : 25
        const catMultiplier = cat === 'barraca' ? 1 : cat === 'distribuidor' ? 0.88 : cat === 'oferta' ? 0.8 : 1.4
        const price = Math.round(basePrice * catMultiplier * 20) // 20 units per funda
        // Get the correct presentation for this brand variant
        const presentation = PRESENTATIONS.find(p => p.product_id === 'prod-1' && p.weight_kg === 1 && p.type === 'bolsa' && p.with_brand === brand)
        if (presentation) {
          prices.push(createPrice(enduido, presentation, brand, cat, price, 'funda', 20))
        }
      })
    })
  }

  // ===== ENDUIDO - Bolsa 2kg =====
  const end2kg = PRESENTATIONS.find(p => p.product_id === 'prod-1' && p.weight_kg === 2 && p.type === 'bolsa' && p.with_brand === true)
  if (end2kg) {
    // Sold by funda (10 units = 20 kg)
    // Restricted for consumidor_final category
    categories.forEach(cat => {
      if (cat === 'consumidor_final') return // Skip this category
      brands.forEach(brand => {
        const basePrice = brand ? 52 : 45
        const catMultiplier = cat === 'barraca' ? 1 : cat === 'distribuidor' ? 0.89 : cat === 'oferta' ? 0.8 : 1.38
        const price = Math.round(basePrice * catMultiplier * 10) // 10 units per funda
        // Get the correct presentation for this brand variant
        const presentation = PRESENTATIONS.find(p => p.product_id === 'prod-1' && p.weight_kg === 2 && p.type === 'bolsa' && p.with_brand === brand)
        if (presentation) {
          prices.push(createPrice(enduido, presentation, brand, cat, price, 'funda', 10))
        }
      })
    })
  }

  // ===== ENDUIDO - Bolsa 5kg (sold by unit) =====
  const end5kg = PRESENTATIONS.find(p => p.product_id === 'prod-1' && p.weight_kg === 5 && p.type === 'bolsa' && p.with_brand === true)
  if (end5kg) {
    categories.forEach(cat => {
      brands.forEach(brand => {
        const basePrice = brand ? 98 : 85
        const catMultiplier = cat === 'barraca' ? 1 : cat === 'distribuidor' ? 0.88 : cat === 'oferta' ? 0.8 : 1.35
        const price = Math.round(basePrice * catMultiplier)
        const presentation = PRESENTATIONS.find(p => p.product_id === 'prod-1' && p.weight_kg === 5 && p.type === 'bolsa' && p.with_brand === brand)
        if (presentation) {
          prices.push(createPrice(enduido, presentation, brand, cat, price, 'unidad', 1))
        }
      })
    })
  }

  // ===== ENDUIDO - Bolsa 10kg (sold by unit) =====
  const end10kg = PRESENTATIONS.find(p => p.product_id === 'prod-1' && p.weight_kg === 10 && p.type === 'bolsa' && p.with_brand === true)
  if (end10kg) {
    categories.forEach(cat => {
      brands.forEach(brand => {
        const basePrice = brand ? 175 : 155
        const catMultiplier = cat === 'barraca' ? 1 : cat === 'distribuidor' ? 0.89 : cat === 'oferta' ? 0.81 : 1.36
        const price = Math.round(basePrice * catMultiplier)
        const presentation = PRESENTATIONS.find(p => p.product_id === 'prod-1' && p.weight_kg === 10 && p.type === 'bolsa' && p.with_brand === brand)
        if (presentation) {
          prices.push(createPrice(enduido, presentation, brand, cat, price, 'unidad', 1))
        }
      })
    })
  }

  // ===== ENDUIDO - Bolsa 20kg (sold by unit) =====
  const end20kg = PRESENTATIONS.find(p => p.product_id === 'prod-1' && p.weight_kg === 20 && p.type === 'bolsa' && p.with_brand === true)
  if (end20kg) {
    categories.forEach(cat => {
      brands.forEach(brand => {
        const basePrice = brand ? 330 : 290
        const catMultiplier = cat === 'barraca' ? 1 : cat === 'distribuidor' ? 0.89 : cat === 'oferta' ? 0.81 : 1.36
        const price = Math.round(basePrice * catMultiplier)
        const presentation = PRESENTATIONS.find(p => p.product_id === 'prod-1' && p.weight_kg === 20 && p.type === 'bolsa' && p.with_brand === brand)
        if (presentation) {
          prices.push(createPrice(enduido, presentation, brand, cat, price, 'unidad', 1))
        }
      })
    })
  }

  // ===== MASILLA - Bolsa 1kg =====
  const mas1kg = PRESENTATIONS.find(p => p.product_id === 'prod-2' && p.weight_kg === 1 && p.type === 'bolsa' && p.with_brand === true)
  if (mas1kg) {
    // Restricted for consumidor_final category
    categories.forEach(cat => {
      if (cat === 'consumidor_final') return // Skip this category
      brands.forEach(brand => {
        const basePrice = brand ? 28 : 22
        const catMultiplier = cat === 'barraca' ? 1 : cat === 'distribuidor' ? 0.91 : cat === 'oferta' ? 0.82 : 1.41
        const price = Math.round(basePrice * catMultiplier)
        const presentation = PRESENTATIONS.find(p => p.product_id === 'prod-2' && p.weight_kg === 1 && p.type === 'bolsa' && p.with_brand === brand)
        if (presentation) {
          prices.push(createPrice(masilla, presentation, brand, cat, price, 'unidad', 1))
        }
      })
    })
  }

  // ===== MASILLA - Bolsa 2kg =====
  const mas2kg = PRESENTATIONS.find(p => p.product_id === 'prod-2' && p.weight_kg === 2 && p.type === 'bolsa' && p.with_brand === true)
  if (mas2kg) {
    // Restricted for consumidor_final category
    categories.forEach(cat => {
      if (cat === 'consumidor_final') return // Skip this category
      brands.forEach(brand => {
        const basePrice = brand ? 48 : 40
        const catMultiplier = cat === 'barraca' ? 1 : cat === 'distribuidor' ? 0.9 : cat === 'oferta' ? 0.8 : 1.4
        const price = Math.round(basePrice * catMultiplier)
        const presentation = PRESENTATIONS.find(p => p.product_id === 'prod-2' && p.weight_kg === 2 && p.type === 'bolsa' && p.with_brand === brand)
        if (presentation) {
          prices.push(createPrice(masilla, presentation, brand, cat, price, 'unidad', 1))
        }
      })
    })
  }

  // ===== MASILLA - Bolsa 5kg =====
  const mas5kg = PRESENTATIONS.find(p => p.product_id === 'prod-2' && p.weight_kg === 5 && p.type === 'bolsa' && p.with_brand === true)
  if (mas5kg) {
    categories.forEach(cat => {
      brands.forEach(brand => {
        const basePrice = brand ? 92 : 78
        const catMultiplier = cat === 'barraca' ? 1 : cat === 'distribuidor' ? 0.89 : cat === 'oferta' ? 0.8 : 1.35
        const price = Math.round(basePrice * catMultiplier)
        const presentation = PRESENTATIONS.find(p => p.product_id === 'prod-2' && p.weight_kg === 5 && p.type === 'bolsa' && p.with_brand === brand)
        if (presentation) {
          prices.push(createPrice(masilla, presentation, brand, cat, price, 'unidad', 1))
        }
      })
    })
  }

  // ===== MASILLA - Bolsa 10kg =====
  const mas10kg = PRESENTATIONS.find(p => p.product_id === 'prod-2' && p.weight_kg === 10 && p.type === 'bolsa' && p.with_brand === true)
  if (mas10kg) {
    categories.forEach(cat => {
      brands.forEach(brand => {
        const basePrice = brand ? 162 : 140
        const catMultiplier = cat === 'barraca' ? 1 : cat === 'distribuidor' ? 0.89 : cat === 'oferta' ? 0.8 : 1.36
        const price = Math.round(basePrice * catMultiplier)
        const presentation = PRESENTATIONS.find(p => p.product_id === 'prod-2' && p.weight_kg === 10 && p.type === 'bolsa' && p.with_brand === brand)
        if (presentation) {
          prices.push(createPrice(masilla, presentation, brand, cat, price, 'unidad', 1))
        }
      })
    })
  }

  // ===== MASILLA - Bolsa 20kg =====
  const mas20kg = PRESENTATIONS.find(p => p.product_id === 'prod-2' && p.weight_kg === 20 && p.type === 'bolsa' && p.with_brand === true)
  if (mas20kg) {
    categories.forEach(cat => {
      brands.forEach(brand => {
        const basePrice = brand ? 304 : 260
        const catMultiplier = cat === 'barraca' ? 1 : cat === 'distribuidor' ? 0.9 : cat === 'oferta' ? 0.81 : 1.38
        const price = Math.round(basePrice * catMultiplier)
        const presentation = PRESENTATIONS.find(p => p.product_id === 'prod-2' && p.weight_kg === 20 && p.type === 'bolsa' && p.with_brand === brand)
        if (presentation) {
          prices.push(createPrice(masilla, presentation, brand, cat, price, 'unidad', 1))
        }
      })
    })
  }

  // ===== MASILLA - Pote 1.7kg (always branded) =====
  const masPote17 = PRESENTATIONS.find(p => p.product_id === 'prod-2' && p.weight_kg === 1.7 && p.type === 'pote')
  if (masPote17) {
    // Restricted for consumidor_final category
    categories.forEach(cat => {
      if (cat === 'consumidor_final') return // Skip this category
      const basePrice = cat === 'barraca' ? 55 : cat === 'distribuidor' ? 48 : cat === 'oferta' ? 42 : 75
      prices.push(createPrice(masilla, masPote17, true, cat, basePrice, 'unidad', 1))
    })
  }

  // ===== MASILLA - Pote 7kg (always branded) =====
  const masPote7 = PRESENTATIONS.find(p => p.product_id === 'prod-2' && p.weight_kg === 7 && p.type === 'pote')
  if (masPote7) {
    categories.forEach(cat => {
      const basePrice = cat === 'barraca' ? 165 : cat === 'distribuidor' ? 148 : cat === 'oferta' ? 130 : 225
      prices.push(createPrice(masilla, masPote7, true, cat, basePrice, 'unidad', 1))
    })
  }

  // ===== MASILLA - Pote 18kg (always branded) =====
  const masPote18 = PRESENTATIONS.find(p => p.product_id === 'prod-2' && p.weight_kg === 18 && p.type === 'pote')
  if (masPote18) {
    categories.forEach(cat => {
      const basePrice = cat === 'barraca' ? 395 : cat === 'distribuidor' ? 360 : cat === 'oferta' ? 318 : 540
      prices.push(createPrice(masilla, masPote18, true, cat, basePrice, 'unidad', 1))
    })
  }

  return prices
}
