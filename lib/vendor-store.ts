// Vendor store - manages vendedores with localStorage persistence
// Follows the same pattern as client-store.ts

import type { Vendor } from '@/lib/types'

const STORAGE_KEY = 'fox_vendors'
// Tracks ids of seeded vendors that the user has explicitly deactivated or deleted
const DELETED_SEEDS_KEY = 'fox_vendors_deleted_seeds'

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
 * Get the set of seeded vendor ids that have been removed/deactivated by the user
 */
function getDeletedSeedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem(DELETED_SEEDS_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

function saveDeletedSeedIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DELETED_SEEDS_KEY, JSON.stringify([...ids]))
  } catch {}
}

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
 * Get all vendors (seeded + newly created/edited from localStorage).
 * Stored vendors override seeds with the same id.
 * Seeds that were deleted/deactivated by the user are excluded.
 */
export function getAllVendors(): Vendor[] {
  const storedVendors = getStoredVendors()
  const storedIds = new Set(storedVendors.map(v => v.id))
  const deletedSeedIds = getDeletedSeedIds()
  const seedsVisible = SEEDED_VENDORS.filter(
    v => !storedIds.has(v.id) && !deletedSeedIds.has(v.id)
  )
  return [...seedsVisible, ...storedVendors]
}

/**
 * Get a single vendor by ID — stored version takes priority over seed.
 */
export function getVendorById(id: string): Vendor | undefined {
  const stored = getStoredVendors().find(v => v.id === id)
  if (stored) return stored
  return SEEDED_VENDORS.find(v => v.id === id)
}

/**
 * Get active vendors only
 */
export function getActiveVendors(): Vendor[] {
  return getAllVendors().filter(v => v.active)
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

const SEED_IDS = new Set(SEEDED_VENDORS.map(v => v.id))

/**
 * Deactivate a vendor (soft delete / logical removal).
 * For seed vendors, records the id in the deleted-seeds list so they don't resurface on reload.
 */
export function deactivateVendor(id: string): void {
  const vendor = getVendorById(id)
  if (!vendor) return

  if (SEED_IDS.has(id)) {
    // Record in deleted-seeds so the seed won't reappear on next load
    const deletedIds = getDeletedSeedIds()
    deletedIds.add(id)
    saveDeletedSeedIds(deletedIds)
  }

  // Also persist the deactivated state in stored vendors
  saveVendor({ ...vendor, active: false })
}

/**
 * Physically delete a user-created vendor from localStorage.
 * For seed vendors, falls back to deactivation to avoid dangling references.
 */
export function deleteVendor(id: string): void {
  if (SEED_IDS.has(id)) {
    // Can't physically remove a seed — deactivate it instead
    deactivateVendor(id)
    return
  }

  const currentVendors = getStoredVendors()
  saveStoredVendors(currentVendors.filter(v => v.id !== id))
}

/**
 * Activate a vendor
 */
export function activateVendor(id: string): void {
  const vendor = getVendorById(id)
  if (!vendor) return

  if (SEED_IDS.has(id)) {
    // Remove from deleted-seeds so it reappears
    const deletedIds = getDeletedSeedIds()
    deletedIds.delete(id)
    saveDeletedSeedIds(deletedIds)
    // Also remove any stored copy (to avoid stale active:false entry)
    const currentVendors = getStoredVendors()
    saveStoredVendors(currentVendors.filter(v => v.id !== id))
    return
  }

  saveVendor({ ...vendor, active: true })
}
