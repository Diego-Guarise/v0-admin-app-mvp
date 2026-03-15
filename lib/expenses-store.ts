'use client'

import type { Expense } from '@/lib/types'

const EXPENSES_STORAGE_KEY = 'app_expenses'

// In-memory store that persists to localStorage
let expensesCache: Expense[] | null = null

/**
 * Get all expenses from persistent storage
 * First call loads from localStorage, subsequent calls use cache
 */
export function getExpenses(): Expense[] {
  if (typeof window === 'undefined') return []
  
  if (expensesCache !== null) {
    return expensesCache
  }

  try {
    const stored = localStorage.getItem(EXPENSES_STORAGE_KEY)
    if (stored) {
      expensesCache = JSON.parse(stored)
      return expensesCache
    }
  } catch (e) {
    console.error('[v0] Error loading expenses from localStorage:', e)
  }

  return []
}

/**
 * Add a new expense and persist to localStorage
 */
export function addExpense(expense: Expense): void {
  if (typeof window === 'undefined') return

  const expenses = getExpenses()
  expenses.push(expense)
  expensesCache = expenses
  
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses))
  } catch (e) {
    console.error('[v0] Error saving expenses to localStorage:', e)
  }
}

/**
 * Update an existing expense and persist to localStorage
 */
export function updateExpense(expenseId: string, updates: Partial<Expense>): void {
  if (typeof window === 'undefined') return

  const expenses = getExpenses()
  const index = expenses.findIndex(e => e.id === expenseId)
  
  if (index >= 0) {
    expenses[index] = { ...expenses[index], ...updates }
    expensesCache = expenses
    
    try {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses))
    } catch (e) {
      console.error('[v0] Error saving expenses to localStorage:', e)
    }
  }
}

/**
 * Delete an expense and persist to localStorage
 */
export function deleteExpense(expenseId: string): void {
  if (typeof window === 'undefined') return

  const expenses = getExpenses()
  expensesCache = expenses.filter(e => e.id !== expenseId)
  
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expensesCache))
  } catch (e) {
    console.error('[v0] Error saving expenses to localStorage:', e)
  }
}

/**
 * Initialize with default expenses (only on first load)
 */
export function initializeExpenses(defaultExpenses: Expense[]): void {
  if (typeof window === 'undefined') return

  try {
    const stored = localStorage.getItem(EXPENSES_STORAGE_KEY)
    if (!stored) {
      // First time - initialize with defaults
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(defaultExpenses))
      expensesCache = defaultExpenses
    }
  } catch (e) {
    console.error('[v0] Error initializing expenses:', e)
  }
}

/**
 * Clear all expenses (for testing/reset)
 */
export function clearAllExpenses(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(EXPENSES_STORAGE_KEY)
    expensesCache = null
  } catch (e) {
    console.error('[v0] Error clearing expenses:', e)
  }
}
