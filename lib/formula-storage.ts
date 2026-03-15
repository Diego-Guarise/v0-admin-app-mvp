/**
 * Formula Storage Utility
 * 
 * Provides persistent storage for product formulas using localStorage.
 * Single source of truth: persisted data always takes precedence over mock data.
 */

import type { ProductFormula } from './types'

const STORAGE_KEY = 'fox_product_formulas'

/**
 * Get formulas for a specific product from persistent storage.
 * If not found, returns null (caller should use mock-data as fallback).
 */
export function getPersistedFormulas(productId: string): ProductFormula[] | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    
    const allFormulas = JSON.parse(stored) as ProductFormula[]
    const productFormulas = allFormulas.filter(f => f.product_id === productId)
    
    return productFormulas.length > 0 ? productFormulas : null
  } catch (error) {
    console.error('[FormulaStorage] Error reading from localStorage:', error)
    return null
  }
}

/**
 * Save formulas for a specific product to persistent storage.
 * Merges with existing data: removes old formulas for this product, adds new ones.
 */
export function saveFormulas(productId: string, formulas: ProductFormula[]): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    // Get all existing formulas
    const stored = localStorage.getItem(STORAGE_KEY)
    const allFormulas = stored ? (JSON.parse(stored) as ProductFormula[]) : []
    
    // Remove old formulas for this product
    const otherProductFormulas = allFormulas.filter(f => f.product_id !== productId)
    
    // Add new formulas
    const updated = [...otherProductFormulas, ...formulas]
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    console.log(`[FormulaStorage] Saved ${formulas.length} formulas for product ${productId}`)
    return true
  } catch (error) {
    console.error('[FormulaStorage] Error writing to localStorage:', error)
    return false
  }
}

/**
 * Get all formulas for all products from persistent storage.
 */
export function getAllPersistedFormulas(): ProductFormula[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as ProductFormula[]) : []
  } catch (error) {
    console.error('[FormulaStorage] Error reading all formulas from localStorage:', error)
    return []
  }
}

/**
 * Clear all persisted formulas (for testing/reset purposes).
 */
export function clearAllFormulas(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('[FormulaStorage] Cleared all persisted formulas')
  } catch (error) {
    console.error('[FormulaStorage] Error clearing localStorage:', error)
  }
}
