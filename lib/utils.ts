import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * onFocus handler for numeric inputs.
 * Selects all content when the current value is exactly 0 or "0",
 * so the next keystroke replaces it cleanly (e.g. typing "9" → "9", not "09").
 * Non-zero values (0.5, 12, etc.) are left untouched.
 */
export function selectIfZero(e: React.FocusEvent<HTMLInputElement>) {
  const raw = e.target.value
  if (raw === '0' || raw === '') {
    e.target.select()
  }
}
