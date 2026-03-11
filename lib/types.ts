// ============================================
// FOX Admin - Type Definitions
// ============================================

// Enums
export type OrderStatus = 'en_produccion' | 'finalizado' | 'entregado' | 'cobrado' | 'anulado'
export type PaymentStatus = 'pendiente' | 'parcial' | 'cobrado'
export type CommissionStatus = 'pendiente_liquidar' | 'liquidado' | 'excluido'
export type PriceCategory = 'barraca' | 'barraca_marca' | 'distribuidor' | 'distribuidor_marca' | 'oferta' | 'consumidor_final'
export type ProductType = 'enduido' | 'masilla'
export type PresentationType = 'bolsa' | 'pote'
export type ExpenseType = 'unico' | 'recurrente' | 'diferido'
export type ExpenseStatus = 'activo' | 'anulado'
export type RecurrenceFrequency = 'semanal' | 'quincenal' | 'mensual' | 'bimestral' | 'trimestral' | 'semestral' | 'anual'

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
  cobrado: 'Cobrado',
  anulado: 'Anulado',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendiente: 'Pendiente',
  parcial: 'Parcial',
  cobrado: 'Cobrado',
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

// Products
export interface Product {
  id: string
  name: string
  type: ProductType
  active: boolean
}

// Presentations
export interface Presentation {
  id: string
  name: string
  type: PresentationType
  weight_kg: number
  active: boolean
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
