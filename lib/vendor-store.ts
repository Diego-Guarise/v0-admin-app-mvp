// Vendor store - manages vendedores with localStorage persistence
// Follows the same pattern as client-store.ts

import type { Vendor } from '@/lib/types'

const STORAGE_KEY = 'fox_vendors'

// Seeded vendors with demo data
const SEEDED_VENDORS: Vendor[] = [
  {
    id: 'vend-1',
    name: 'Juan Perez',
    phone: '+34 666 123 456',
    email: 'juan@fox.com',
    commission_percentage: 5,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'vend-2',
    name: 'Maria Garcia',
    phone: '+34 666 234 567',
    email: 'maria@fox.com',
    commission_percentage: 4.5,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'vend-3',
    name: 'Carlos Lopez',
    phone: '+34 666 345 678',
    email: 'carlos@fox.com',
    commission_percentage: 3.5,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

/**
 * Get newly created vendors from localStorage
 */
function getStoredVendors(): Vendor[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save vendors to localStorage
 */
function saveStoredVendors(vendors: Vendor[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors))
  } catch {
    // Silently fail if localStorage not available
  }
}

/**
 * Get all vendors (seeded + newly created)
 */
export function getAllVendors(): Vendor[] {
  const createdVendors = getStoredVendors()
  return [...SEEDED_VENDORS, ...createdVendors]
}

/**
 * Get active vendors only
 */
export function getActiveVendors(): Vendor[] {
  return getAllVendors().filter(v => v.active)
}

/**
 * Get a single vendor by ID
 */
export function getVendorById(id: string): Vendor | undefined {
  return getAllVendors().find(v => v.id === id)
}

/**
 * Create a new vendor
 */
export function createVendor(vendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>): Vendor {
  const newVendor: Vendor = {
    ...vendor,
    id: `vend-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  const currentVendors = getStoredVendors()
  saveStoredVendors([...currentVendors, newVendor])
  
  return newVendor
}

/**
 * Save/update a vendor
 */
export function saveVendor(vendor: Vendor): void {
  const currentVendors = getStoredVendors()
  const index = currentVendors.findIndex(v => v.id === vendor.id)
  
  if (index >= 0) {
    currentVendors[index] = { ...vendor, updated_at: new Date().toISOString() }
  } else {
    currentVendors.push({ ...vendor, updated_at: new Date().toISOString() })
  }
  
  saveStoredVendors(currentVendors)
}

/**
 * Deactivate a vendor (soft delete)
 */
export function deactivateVendor(id: string): void {
  const vendor = getVendorById(id)
  if (vendor) {
    saveVendor({ ...vendor, active: false })
  }
}

/**
 * Activate a vendor
 */
export function activateVendor(id: string): void {
  const vendor = getVendorById(id)
  if (vendor) {
    saveVendor({ ...vendor, active: true })
  }
}
