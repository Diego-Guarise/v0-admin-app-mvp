// Liquidacion store - manages commission settlements with localStorage persistence
// Similar pattern to order-store and vendor-store

import type { Liquidacion } from '@/lib/types'

const STORAGE_KEY = 'fox_liquidaciones'

/**
 * Get all liquidaciones from localStorage
 */
function getStoredLiquidaciones(): Liquidacion[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save liquidaciones to localStorage
 */
function saveStoredLiquidaciones(liquidaciones: Liquidacion[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(liquidaciones))
  } catch {
    // Silently fail if localStorage not available
  }
}

/**
 * Get all liquidaciones
 */
export function getAllLiquidaciones(): Liquidacion[] {
  return getStoredLiquidaciones()
}

/**
 * Get liquidaciones for a specific vendor
 */
export function getLiquidacionesByVendor(vendorId: string): Liquidacion[] {
  return getAllLiquidaciones().filter(l => l.vendor_id === vendorId)
}

/**
 * Get a single liquidacion by ID
 */
export function getLiquidacionById(id: string): Liquidacion | undefined {
  return getAllLiquidaciones().find(l => l.id === id)
}

/**
 * Create a new liquidacion
 */
export function createLiquidacion(
  vendorId: string,
  selectedOrderIds: string[],
  totalBaseWithoutIva: number,
  commissionPercentage: number,
  notes?: string
): Liquidacion {
  const totalCommissionPaid = totalBaseWithoutIva * (commissionPercentage / 100)
  
  const newLiquidacion: Liquidacion = {
    id: `liq-${Date.now()}`,
    vendor_id: vendorId,
    liquidation_date: new Date().toISOString().split('T')[0], // Date only
    selected_order_ids: selectedOrderIds,
    total_base_without_iva: totalBaseWithoutIva,
    commission_percentage: commissionPercentage,
    total_commission_paid: totalCommissionPaid,
    notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  const currentLiquidaciones = getStoredLiquidaciones()
  saveStoredLiquidaciones([...currentLiquidaciones, newLiquidacion])
  
  return newLiquidacion
}

/**
 * Save/update a liquidacion
 */
export function saveLiquidacion(liquidacion: Liquidacion): void {
  const currentLiquidaciones = getStoredLiquidaciones()
  const index = currentLiquidaciones.findIndex(l => l.id === liquidacion.id)
  
  if (index >= 0) {
    currentLiquidaciones[index] = { ...liquidacion, updated_at: new Date().toISOString() }
  } else {
    currentLiquidaciones.push({ ...liquidacion, updated_at: new Date().toISOString() })
  }
  
  saveStoredLiquidaciones(currentLiquidaciones)
}

/**
 * Delete a liquidacion (hard delete - used for corrections)
 */
export function deleteLiquidacion(id: string): void {
  const currentLiquidaciones = getStoredLiquidaciones()
  const filtered = currentLiquidaciones.filter(l => l.id !== id)
  saveStoredLiquidaciones(filtered)
}
