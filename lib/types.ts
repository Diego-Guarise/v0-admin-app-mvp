// ============================================
// FOX Admin - Type Definitions
// Sistema de gestión para fabricación de enduido y masilla
// ============================================

// Enums - Estados separados para mayor claridad
export type OrderStatus = 'en_produccion' | 'finalizado' | 'entregado' | 'anulado'
export type PaymentStatus = 'pendiente' | 'parcial' | 'cobrado'
export type CommissionStatus = 'pendiente_liquidar' | 'liquidado' | 'excluido'
export type ClientStatus = 'activo' | 'inactivo'
export type PriceCategory = 'barraca' | 'barraca_marca' | 'distribuidor' | 'distribuidor_marca' | 'oferta' | 'consumidor_final'
export type ProductType = 'enduido' | 'masilla'
export type PresentationType = 'bolsa' | 'pote'
export type UnitOfMeasure = 'kg' | 'g' | 'l' | 'ml' | 'unidad'
export type IngredientCategory = 'materia_prima' | 'aditivo' | 'envase' | 'etiqueta' | 'operativo'
export type IngredientStatus = 'activo' | 'inactivo'
export type ExpenseType = 'unico' | 'recurrente' | 'diferido'
export type ExpenseStatus = 'activo' | 'anulado'
export type RecurrenceFrequency = 'semanal' | 'quincenal' | 'mensual' | 'bimestral' | 'trimestral' | 'semestral' | 'anual'
export type PaymentMethod = 'efectivo' | 'transferencia' | 'cheque' | 'credito'

// Price category labels for UI
export const PRICE_CATEGORY_LABELS: Record<PriceCategory, string> = {
  barraca: 'Barraca',
  barraca_marca: 'Barraca con marca',
  distribuidor: 'Distribuidor',
  distribuidor_marca: 'Distribuidor con marca',
  oferta: 'Oferta',
  consumidor_final: 'Consumidor final',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  en_produccion: 'En producción',
  finalizado: 'Finalizado',
  entregado: 'Entregado',
  anulado: 'Anulado',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendiente: 'Pendiente',
  parcial: 'Parcial',
  cobrado: 'Cobrado',
}

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  pendiente_liquidar: 'Pendiente de liquidar',
  liquidado: 'Liquidado',
  excluido: 'Excluido',
}

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
}

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  unico: 'Único',
  recurrente: 'Recurrente',
  diferido: 'Pago diferido',
}

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  activo: 'Activo',
  anulado: 'Anulado',
}

export const RECURRENCE_FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
  bimestral: 'Bimestral',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  cheque: 'Cheque',
  credito: 'Crédito',
}

export const UNIT_OF_MEASURE_LABELS: Record<UnitOfMeasure, string> = {
  kg: 'Kilogramos',
  g: 'Gramos',
  l: 'Litros',
  ml: 'Mililitros',
  unidad: 'Unidades',
}

export const UNIT_OF_MEASURE_ABBR: Record<UnitOfMeasure, string> = {
  kg: 'kg',
  g: 'g',
  l: 'L',
  ml: 'ml',
  unidad: 'un',
}

export const INGREDIENT_CATEGORY_LABELS: Record<IngredientCategory, string> = {
  materia_prima: 'Materia prima',
  aditivo: 'Aditivo',
  envase: 'Envase',
  etiqueta: 'Etiqueta',
  operativo: 'Operativo',
}

export const INGREDIENT_STATUS_LABELS: Record<IngredientStatus, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
}

// Products
export interface Product {
  id: string
  name: string
  type: ProductType
  description?: string
  notes?: string
  active: boolean
  created_at: string
  updated_at: string
}

// Presentations - Enhanced with brand support
export interface Presentation {
  id: string
  product_id: string
  name: string
  type: PresentationType
  weight_kg: number
  with_brand: boolean
  active: boolean
  created_at: string
  updated_at: string
}

// Ingredient Inputs (Insumos)
export interface IngredientInput {
  id: string
  name: string
  category: IngredientCategory
  unit_of_measure: UnitOfMeasure
  description?: string
  notes?: string
  status: IngredientStatus
  created_at: string
  updated_at: string
}

// Ingredient Costs (Costos de Insumo)
export interface IngredientCost {
  id: string
  insumo_id: string
  insumo?: IngredientInput
  date: string
  provider?: string
  quantity: number
  unit_of_measure: UnitOfMeasure
  total_amount: number
  has_invoice: boolean
  // Calculated fields
  amount_without_iva: number
  iva: number
  unit_cost_with_iva: number
  unit_cost_without_iva: number
  notes?: string
  created_at: string
  updated_at: string
}

// Product Formula (Formula de Producto)
export interface ProductFormula {
  id: string
  product_id: string
  product?: Product
  insumo_id: string
  insumo?: IngredientInput
  quantity_per_kg: number // Amount of ingredient per kg of product
  unit_of_measure?: UnitOfMeasure // Unit can be specified per formula row (overrides insumo unit)
  notes?: string
  active: boolean
  version: number // Version number for history tracking
  created_at: string
  updated_at: string
  updated_by?: string // Optional: who last edited
}

// Presentation Cost (Costo de Presentación) - Calculated
export interface PresentationCost {
  presentation_id: string
  presentation?: Presentation
  product_id: string
  product?: Product
  // Costs breakdown
  product_cost_per_kg: number
  product_cost_for_weight: number
  envase_cost: number
  etiqueta_cost: number // Only included if with_brand = true
  total_cost_without_iva: number
  total_cost_with_iva: number
  // Pricing and margins (when price available)
  selling_price?: number
  margin_over_price?: number // (price - cost) / price * 100
  markup_over_cost?: number // (price - cost) / cost * 100
}

// Clients
export interface Client {
  id: string
  name: string
  company?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  active: boolean
  created_at: string
  updated_at: string
}

// Order Items
export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product: Product
  presentation_id: string
  presentation: Presentation
  with_brand: boolean
  quantity: number
  unit_price: number
  subtotal: number
}

// Orders
export interface Order {
  id: string
  order_number: number
  order_date: string
  promised_date: string
  client_id: string
  client: Client
  vendor_id?: string
  vendor_name?: string
  price_category: PriceCategory
  notes?: string
  items: OrderItem[]
  subtotal: number
  iva: number
  total: number
  enduido_kg: number
  masilla_kg: number
  status: OrderStatus
  payment_status: PaymentStatus
  commission_status: CommissionStatus
  manual_price: boolean
  created_at: string
  updated_at: string
}

// Expense Categories
export interface ExpenseCategory {
  id: string
  name: string
  subcategories?: string[]
}

// Expenses
export interface Expense {
  id: string
  date: string
  accounting_month: string
  concept: string
  category_id: string
  category: ExpenseCategory
  subcategory?: string
  supplier?: string
  amount: number
  amount_without_iva: number
  iva: number
  has_invoice: boolean
  notes?: string
  expense_type: ExpenseType
  status: ExpenseStatus
  due_date?: string
  payment_method?: string
  check_number?: string
  // For recurrent expenses
  recurrence_frequency?: RecurrenceFrequency
  estimated_day?: number
  estimated_amount?: number
  created_at: string
  updated_at: string
}

// Dashboard Stats
export interface DashboardStats {
  monthly_sales_without_iva: number
  monthly_sales_with_iva: number
  monthly_expenses: number
  enduido_kg_sold: number
  masilla_kg_sold: number
}

// Future entities (prepared structure)
export interface Supplier {
  id: string
  name: string
  contact?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  active: boolean
}

export interface Vendor {
  id: string
  name: string
  phone?: string
  email?: string
  commission_rate: number
  active: boolean
}

export interface CommissionSettlement {
  id: string
  vendor_id: string
  period_start: string
  period_end: string
  total_sales: number
  commission_amount: number
  settled_at?: string
}

export interface ProductionCost {
  id: string
  product_id: string
  date: string
  raw_material_cost: number
  labor_cost: number
  overhead_cost: number
  total_cost_per_kg: number
}

// Configuration
export interface AppConfig {
  iva_rate: number
  default_currency: string
}

export const DEFAULT_CONFIG: AppConfig = {
  iva_rate: 0.22,
  default_currency: 'UYU',
}

// ============================================
// IVA Calculation Helpers
// ============================================

/**
 * Calculate IVA breakdown for ingredient costs
 * @param total_amount - The total amount paid
 * @param has_invoice - Whether the purchase has a formal invoice with IVA
 * @param quantity - The quantity purchased
 */
export function calculateIngredientCostIVA(
  total_amount: number,
  has_invoice: boolean,
  quantity: number
): {
  amount_without_iva: number
  iva: number
  unit_cost_with_iva: number
  unit_cost_without_iva: number
} {
  if (has_invoice) {
    // Invoice includes IVA - extract it
    const amount_without_iva = total_amount / 1.22
    const iva = total_amount - amount_without_iva
    return {
      amount_without_iva,
      iva,
      unit_cost_with_iva: total_amount / quantity,
      unit_cost_without_iva: amount_without_iva / quantity,
    }
  } else {
    // No invoice - no IVA to extract
    return {
      amount_without_iva: total_amount,
      iva: 0,
      unit_cost_with_iva: total_amount / quantity,
      unit_cost_without_iva: total_amount / quantity,
    }
  }
}

/**
 * Calculate profit margins
 * @param selling_price - The selling price
 * @param cost - The cost
 */
export function calculateProfitMargins(
  selling_price: number,
  cost: number
): {
  margin_over_price: number
  markup_over_cost: number
} {
  if (selling_price === 0 || cost === 0) {
    return { margin_over_price: 0, markup_over_cost: 0 }
  }
  return {
    margin_over_price: ((selling_price - cost) / selling_price) * 100,
    markup_over_cost: ((selling_price - cost) / cost) * 100,
  }
}

// ============================================
// Unit Conversion Helpers (Compatible Units Only)
// ============================================

/**
 * Unit family definitions - only convert within same family
 */
export type UnitFamily = 'mass' | 'volume' | 'count'

export const UNIT_FAMILIES: Record<UnitOfMeasure, UnitFamily> = {
  kg: 'mass',
  g: 'mass',
  l: 'volume',
  ml: 'volume',
  unidad: 'count',
}

/**
 * Base units for each family
 */
export const BASE_UNITS: Record<UnitFamily, UnitOfMeasure> = {
  mass: 'kg',
  volume: 'l',
  count: 'unidad',
}

/**
 * Conversion factors to base unit
 * kg = 1, g = 0.001 (1g = 0.001kg)
 * l = 1, ml = 0.001 (1ml = 0.001l)
 * unidad = 1
 */
export const CONVERSION_TO_BASE: Record<UnitOfMeasure, number> = {
  kg: 1,
  g: 0.001,
  l: 1,
  ml: 0.001,
  unidad: 1,
}

/**
 * Check if two units are compatible (same family)
 */
export function areUnitsCompatible(unit1: UnitOfMeasure, unit2: UnitOfMeasure): boolean {
  return UNIT_FAMILIES[unit1] === UNIT_FAMILIES[unit2]
}

/**
 * Convert value from one unit to another (within same family only)
 * Returns null if units are incompatible
 * 
 * @param value - The value to convert
 * @param fromUnit - The source unit
 * @param toUnit - The target unit
 * @returns Converted value or null if incompatible
 */
export function convertUnit(
  value: number,
  fromUnit: UnitOfMeasure,
  toUnit: UnitOfMeasure
): number | null {
  // Check compatibility
  if (!areUnitsCompatible(fromUnit, toUnit)) {
    return null
  }
  
  // Same unit - no conversion needed
  if (fromUnit === toUnit) {
    return value
  }
  
  // Convert: value in fromUnit -> base unit -> toUnit
  const valueInBase = value * CONVERSION_TO_BASE[fromUnit]
  const result = valueInBase / CONVERSION_TO_BASE[toUnit]
  
  return result
}

/**
 * Convert value to base unit of its family
 * Useful for cost calculations where we want to normalize to kg or l
 * 
 * @param value - The value to convert
 * @param unit - The current unit
 * @returns Value in base unit (kg for mass, l for volume, unidad for count)
 */
export function convertToBaseUnit(value: number, unit: UnitOfMeasure): number {
  return value * CONVERSION_TO_BASE[unit]
}

/**
 * Get the base unit for a given unit
 */
export function getBaseUnit(unit: UnitOfMeasure): UnitOfMeasure {
  const family = UNIT_FAMILIES[unit]
  return BASE_UNITS[family]
}
