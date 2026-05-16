// This file manages the client store across the app
// It provides access to both seeded clients and newly created clients
// Uses browser localStorage to persist newly created clients across page reloads

import type { Client } from '@/lib/types'
import { CLIENTS as SEEDED_CLIENTS } from '@/lib/mock-data'

const STORAGE_KEY = 'app_created_clients'

/**
 * Get newly created clients from localStorage
 */
function getStoredClients(): Client[] {
  if (typeof window === 'undefined') {
    // Server-side: return empty array, client will have the data
    return []
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save newly created clients to localStorage
 */
function saveStoredClients(clients: Client[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Get all clients (seeded + newly created/edited from localStorage)
 * Clients in localStorage always override seeds with the same id.
 */
export function getAllClients(): Client[] {
  const storedClients = getStoredClients()
  const storedIds = new Set(storedClients.map(c => c.id))
  // Exclude any seed whose id has a stored (possibly edited) version
  const seedsNotOverridden = SEEDED_CLIENTS.filter(c => !storedIds.has(c.id))
  return [...seedsNotOverridden, ...storedClients]
}

/**
 * Get a single client by ID — stored version takes priority over seed.
 */
export function getClientById(id: string): Client | undefined {
  const storedClients = getStoredClients()
  const stored = storedClients.find(c => c.id === id)
  if (stored) return stored
  return SEEDED_CLIENTS.find(c => c.id === id)
}

/**
 * Add or update a client
 */
export function saveClient(client: Client): void {
  const createdClients = getStoredClients()
  const existingIndex = createdClients.findIndex(c => c.id === client.id)
  
  if (existingIndex !== -1) {
    createdClients[existingIndex] = client
  } else {
    createdClients.push(client)
  }
  
  saveStoredClients(createdClients)
}

/**
 * Reset clients (for testing)
 */
export function resetClients(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}
