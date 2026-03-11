import type { 
  Product, 
  Presentation, 
  Client, 
  Order, 
  OrderItem,
  Expense,
  ExpenseCategory,
  DashboardStats 
} from './types'

// ============================================
// Products
// ============================================
export const PRODUCTS: Product[] = [
  { id: 'prod-1', name: 'Enduido Interior', type: 'enduido', active: true },
  { id: 'prod-2', name: 'Masilla para Yeso', type: 'masilla', active: true },
]

// ============================================
// Presentations
// ============================================
export const PRESENTATIONS: Presentation[] = [
  // Bolsas
  { id: 'pres-1', name: 'Bolsa 1 kg', type: 'bolsa', weight_kg: 1, active: true },
  { id: 'pres-2', name: 'Bolsa 2 kg', type: 'bolsa', weight_kg: 2, active: true },
  { id: 'pres-3', name: 'Bolsa 5 kg', type: 'bolsa', weight_kg: 5, active: true },
  { id: 'pres-4', name: 'Bolsa 10 kg', type: 'bolsa', weight_kg: 10, active: true },
  { id: 'pres-5', name: 'Bolsa 20 kg', type: 'bolsa', weight_kg: 20, active: true },
  // Potes
  { id: 'pres-6', name: 'Pote 1.7 kg', type: 'pote', weight_kg: 1.7, active: true },
  { id: 'pres-7', name: 'Pote 7 kg', type: 'pote', weight_kg: 7, active: true },
  { id: 'pres-8', name: 'Pote 18 kg', type: 'pote', weight_kg: 18, active: true },
]

// ============================================
// Expense Categories
// ============================================
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'cat-1', name: 'Materia Prima', subcategories: ['Cal', 'Yeso', 'Otros insumos'] },
  { id: 'cat-2', name: 'Servicios', subcategories: ['Luz', 'Agua', 'Internet', 'Teléfono'] },
  { id: 'cat-3', name: 'Transporte', subcategories: ['Combustible', 'Mantenimiento', 'Peajes'] },
  { id: 'cat-4', name: 'Sueldos', subcategories: ['Personal producción', 'Administración'] },
  { id: 'cat-5', name: 'Alquiler', subcategories: ['Local', 'Depósito'] },
  { id: 'cat-6', name: 'Impuestos', subcategories: ['BPS', 'DGI', 'Otros'] },
  { id: 'cat-7', name: 'Packaging', subcategories: ['Bolsas', 'Potes', 'Etiquetas'] },
  { id: 'cat-8', name: 'Otros', subcategories: [] },
]

// ============================================
// Clients
// ============================================
export const CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Juan Pérez',
    company: 'Barraca El Constructor',
    phone: '099 123 456',
    email: 'juan@elconstructor.com.uy',
    address: 'Av. Italia 1234, Montevideo',
    notes: 'Cliente preferencial, pago puntual',
    active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'cli-2',
    name: 'María González',
    company: 'Distribuidora Norte',
    phone: '098 765 432',
    email: 'maria@distrinorte.com.uy',
    address: 'Ruta 5 km 102, Rivera',
    notes: 'Distribuidor zona norte',
    active: true,
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
  },
  {
    id: 'cli-3',
    name: 'Carlos Rodríguez',
    company: 'Ferretería Central',
    phone: '094 555 789',
    email: 'carlos@ferreteriacentral.com.uy',
    address: 'Sarandí 567, Durazno',
    active: true,
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2024-02-15T10:00:00Z',
  },
  {
    id: 'cli-4',
    name: 'Ana Martínez',
    company: 'Pinturas y Más',
    phone: '091 222 333',
    email: 'ana@pinturasymas.com.uy',
    address: '18 de Julio 890, Paysandú',
    notes: 'Prefiere entregas los martes',
    active: true,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-01T10:00:00Z',
  },
  {
    id: 'cli-5',
    name: 'Roberto Silva',
    company: 'Construcciones Silva',
    phone: '097 888 999',
    email: 'roberto@construccionessilva.com.uy',
    address: 'Av. Gral. Flores 2345, Montevideo',
    active: true,
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
  },
  {
    id: 'cli-6',
    name: 'Laura Fernández',
    phone: '099 111 222',
    email: 'laura.fernandez@gmail.com',
    address: 'Colonia 123, Colonia',
    notes: 'Consumidor final - proyectos puntuales',
    active: true,
    created_at: '2024-04-01T10:00:00Z',
    updated_at: '2024-04-01T10:00:00Z',
  },
]

// ============================================
// Orders
// ============================================
const createOrderItems = (orderId: string): OrderItem[] => {
  const items: OrderItem[][] = [
    [
      {
        id: `item-${orderId}-1`,
        order_id: orderId,
        product_id: 'prod-1',
        product: PRODUCTS[0],
        presentation_id: 'pres-5',
        presentation: PRESENTATIONS[4],
        with_brand: true,
        quantity: 50,
        unit_price: 280,
        subtotal: 14000,
      },
      {
        id: `item-${orderId}-2`,
        order_id: orderId,
        product_id: 'prod-2',
        product: PRODUCTS[1],
        presentation_id: 'pres-4',
        presentation: PRESENTATIONS[3],
        with_brand: true,
        quantity: 30,
        unit_price: 195,
        subtotal: 5850,
      },
    ],
    [
      {
        id: `item-${orderId}-1`,
        order_id: orderId,
        product_id: 'prod-1',
        product: PRODUCTS[0],
        presentation_id: 'pres-8',
        presentation: PRESENTATIONS[7],
        with_brand: false,
        quantity: 25,
        unit_price: 520,
        subtotal: 13000,
      },
    ],
    [
      {
        id: `item-${orderId}-1`,
        order_id: orderId,
        product_id: 'prod-1',
        product: PRODUCTS[0],
        presentation_id: 'pres-3',
        presentation: PRESENTATIONS[2],
        with_brand: true,
        quantity: 100,
        unit_price: 85,
        subtotal: 8500,
      },
      {
        id: `item-${orderId}-2`,
        order_id: orderId,
        product_id: 'prod-2',
        product: PRODUCTS[1],
        presentation_id: 'pres-7',
        presentation: PRESENTATIONS[6],
        with_brand: true,
        quantity: 40,
        unit_price: 210,
        subtotal: 8400,
      },
    ],
  ]
  return items[Math.floor(Math.random() * items.length)]
}

export const ORDERS: Order[] = [
  {
    id: 'ord-1',
    order_number: 1001,
    order_date: '2025-03-01',
    promised_date: '2025-03-05',
    client_id: 'cli-1',
    client: CLIENTS[0],
    vendor_name: 'Pedro Gómez',
    price_category: 'barraca_marca',
    notes: 'Entregar en horario de mañana',
    items: createOrderItems('ord-1'),
    subtotal: 19850,
    iva: 4367,
    total: 24217,
    enduido_kg: 1000,
    masilla_kg: 300,
    status: 'entregado',
    payment_status: 'cobrado',
    commission_status: 'liquidado',
    manual_price: false,
    created_at: '2025-03-01T09:00:00Z',
    updated_at: '2025-03-05T14:00:00Z',
  },
  {
    id: 'ord-2',
    order_number: 1002,
    order_date: '2025-03-03',
    promised_date: '2025-03-07',
    client_id: 'cli-2',
    client: CLIENTS[1],
    vendor_name: 'Pedro Gómez',
    price_category: 'distribuidor',
    items: createOrderItems('ord-2'),
    subtotal: 13000,
    iva: 2860,
    total: 15860,
    enduido_kg: 450,
    masilla_kg: 0,
    status: 'entregado',
    payment_status: 'pendiente',
    commission_status: 'pendiente_liquidar',
    manual_price: false,
    created_at: '2025-03-03T11:00:00Z',
    updated_at: '2025-03-07T10:00:00Z',
  },
  {
    id: 'ord-3',
    order_number: 1003,
    order_date: '2025-03-05',
    promised_date: '2025-03-10',
    client_id: 'cli-3',
    client: CLIENTS[2],
    vendor_name: 'Ana López',
    price_category: 'barraca',
    notes: 'Cliente nuevo - primer pedido',
    items: createOrderItems('ord-3'),
    subtotal: 16900,
    iva: 3718,
    total: 20618,
    enduido_kg: 500,
    masilla_kg: 280,
    status: 'finalizado',
    payment_status: 'pendiente',
    commission_status: 'pendiente_liquidar',
    manual_price: false,
    created_at: '2025-03-05T15:00:00Z',
    updated_at: '2025-03-08T16:00:00Z',
  },
  {
    id: 'ord-4',
    order_number: 1004,
    order_date: '2025-03-06',
    promised_date: '2025-03-12',
    client_id: 'cli-4',
    client: CLIENTS[3],
    vendor_name: 'Pedro Gómez',
    price_category: 'distribuidor_marca',
    items: createOrderItems('ord-4'),
    subtotal: 19850,
    iva: 4367,
    total: 24217,
    enduido_kg: 1000,
    masilla_kg: 300,
    status: 'en_produccion',
    payment_status: 'pendiente',
    commission_status: 'pendiente_liquidar',
    manual_price: false,
    created_at: '2025-03-06T10:00:00Z',
    updated_at: '2025-03-06T10:00:00Z',
  },
  {
    id: 'ord-5',
    order_number: 1005,
    order_date: '2025-03-07',
    promised_date: '2025-03-14',
    client_id: 'cli-5',
    client: CLIENTS[4],
    vendor_name: 'Ana López',
    price_category: 'consumidor_final',
    notes: 'Proyecto de remodelación oficinas',
    items: createOrderItems('ord-5'),
    subtotal: 13000,
    iva: 2860,
    total: 15860,
    enduido_kg: 450,
    masilla_kg: 0,
    status: 'en_produccion',
    payment_status: 'pendiente',
    commission_status: 'pendiente_liquidar',
    manual_price: false,
    created_at: '2025-03-07T14:00:00Z',
    updated_at: '2025-03-07T14:00:00Z',
  },
  {
    id: 'ord-6',
    order_number: 1006,
    order_date: '2025-03-08',
    promised_date: '2025-03-15',
    client_id: 'cli-1',
    client: CLIENTS[0],
    vendor_name: 'Pedro Gómez',
    price_category: 'barraca_marca',
    items: createOrderItems('ord-6'),
    subtotal: 16900,
    iva: 3718,
    total: 20618,
    enduido_kg: 500,
    masilla_kg: 280,
    status: 'en_produccion',
    payment_status: 'pendiente',
    commission_status: 'pendiente_liquidar',
    manual_price: false,
    created_at: '2025-03-08T09:30:00Z',
    updated_at: '2025-03-08T09:30:00Z',
  },
  {
    id: 'ord-7',
    order_number: 1007,
    order_date: '2025-03-09',
    promised_date: '2025-03-16',
    client_id: 'cli-6',
    client: CLIENTS[5],
    price_category: 'consumidor_final',
    notes: 'Retira en fábrica',
    items: createOrderItems('ord-7'),
    subtotal: 19850,
    iva: 4367,
    total: 24217,
    enduido_kg: 1000,
    masilla_kg: 300,
    status: 'finalizado',
    payment_status: 'parcial',
    commission_status: 'excluido',
    manual_price: true,
    created_at: '2025-03-09T11:00:00Z',
    updated_at: '2025-03-10T15:00:00Z',
  },
]

// ============================================
// Expenses
// ============================================
export const EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    date: '2025-03-01',
    accounting_month: '2025-03',
    concept: 'Compra de cal hidratada',
    category_id: 'cat-1',
    category: EXPENSE_CATEGORIES[0],
    subcategory: 'Cal',
    supplier: 'Cales del Norte S.A.',
    amount: 45000,
    amount_without_iva: 36885.25,
    iva: 8114.75,
    has_invoice: true,
    expense_type: 'unico',
    status: 'activo',
    created_at: '2025-03-01T10:00:00Z',
    updated_at: '2025-03-01T10:00:00Z',
  },
  {
    id: 'exp-2',
    date: '2025-03-01',
    accounting_month: '2025-03',
    concept: 'Alquiler local - Marzo',
    category_id: 'cat-5',
    category: EXPENSE_CATEGORIES[4],
    subcategory: 'Local',
    supplier: 'Inmobiliaria Rodríguez',
    amount: 35000,
    amount_without_iva: 35000,
    iva: 0,
    has_invoice: false,
    expense_type: 'recurrente',
    status: 'activo',
    recurrence_frequency: 'mensual',
    estimated_day: 1,
    estimated_amount: 35000,
    created_at: '2025-03-01T08:00:00Z',
    updated_at: '2025-03-01T08:00:00Z',
  },
  {
    id: 'exp-3',
    date: '2025-03-03',
    accounting_month: '2025-03',
    concept: 'Factura UTE - Febrero',
    category_id: 'cat-2',
    category: EXPENSE_CATEGORIES[1],
    subcategory: 'Luz',
    supplier: 'UTE',
    amount: 12500,
    amount_without_iva: 10245.90,
    iva: 2254.10,
    has_invoice: true,
    expense_type: 'recurrente',
    status: 'activo',
    recurrence_frequency: 'mensual',
    estimated_day: 5,
    estimated_amount: 12000,
    created_at: '2025-03-03T09:00:00Z',
    updated_at: '2025-03-03T09:00:00Z',
  },
  {
    id: 'exp-4',
    date: '2025-03-05',
    accounting_month: '2025-03',
    concept: 'Combustible camión',
    category_id: 'cat-3',
    category: EXPENSE_CATEGORIES[2],
    subcategory: 'Combustible',
    supplier: 'ANCAP',
    amount: 8500,
    amount_without_iva: 6967.21,
    iva: 1532.79,
    has_invoice: true,
    expense_type: 'unico',
    status: 'activo',
    created_at: '2025-03-05T14:00:00Z',
    updated_at: '2025-03-05T14:00:00Z',
  },
  {
    id: 'exp-5',
    date: '2025-03-07',
    accounting_month: '2025-03',
    concept: 'Compra bolsas packaging 20kg',
    category_id: 'cat-7',
    category: EXPENSE_CATEGORIES[6],
    subcategory: 'Bolsas',
    supplier: 'Envases Plásticos S.A.',
    amount: 28000,
    amount_without_iva: 22950.82,
    iva: 5049.18,
    has_invoice: true,
    expense_type: 'unico',
    status: 'activo',
    created_at: '2025-03-07T11:00:00Z',
    updated_at: '2025-03-07T11:00:00Z',
  },
  {
    id: 'exp-6',
    date: '2025-03-08',
    accounting_month: '2025-03',
    concept: 'Pago cheque diferido - Yeso',
    category_id: 'cat-1',
    category: EXPENSE_CATEGORIES[0],
    subcategory: 'Yeso',
    supplier: 'Yesos del Sur',
    amount: 55000,
    amount_without_iva: 45081.97,
    iva: 9918.03,
    has_invoice: true,
    expense_type: 'diferido',
    status: 'activo',
    due_date: '2025-04-15',
    payment_method: 'Cheque',
    check_number: 'CH-2345',
    created_at: '2025-03-08T10:00:00Z',
    updated_at: '2025-03-08T10:00:00Z',
  },
  {
    id: 'exp-7',
    date: '2025-03-10',
    accounting_month: '2025-03',
    concept: 'Sueldos producción - Marzo',
    category_id: 'cat-4',
    category: EXPENSE_CATEGORIES[3],
    subcategory: 'Personal producción',
    amount: 120000,
    amount_without_iva: 120000,
    iva: 0,
    has_invoice: false,
    expense_type: 'recurrente',
    status: 'activo',
    recurrence_frequency: 'mensual',
    estimated_day: 25,
    estimated_amount: 120000,
    created_at: '2025-03-10T08:00:00Z',
    updated_at: '2025-03-10T08:00:00Z',
  },
  {
    id: 'exp-8',
    date: '2025-02-15',
    accounting_month: '2025-02',
    concept: 'Mantenimiento camión',
    category_id: 'cat-3',
    category: EXPENSE_CATEGORIES[2],
    subcategory: 'Mantenimiento',
    supplier: 'Taller Mecánico González',
    amount: 15000,
    amount_without_iva: 12295.08,
    iva: 2704.92,
    has_invoice: true,
    expense_type: 'unico',
    status: 'activo',
    created_at: '2025-02-15T16:00:00Z',
    updated_at: '2025-02-15T16:00:00Z',
  },
]

// ============================================
// Dashboard Stats (calculated from mock data)
// ============================================
export const DASHBOARD_STATS: DashboardStats = {
  monthly_sales_without_iva: ORDERS
    .filter(o => o.order_date.startsWith('2025-03') && o.status !== 'anulado')
    .reduce((acc, o) => acc + o.subtotal, 0),
  monthly_sales_with_iva: ORDERS
    .filter(o => o.order_date.startsWith('2025-03') && o.status !== 'anulado')
    .reduce((acc, o) => acc + o.total, 0),
  monthly_expenses: EXPENSES
    .filter(e => e.accounting_month === '2025-03' && e.status === 'activo')
    .reduce((acc, e) => acc + e.amount, 0),
  enduido_kg_sold: ORDERS
    .filter(o => o.order_date.startsWith('2025-03') && o.status !== 'anulado')
    .reduce((acc, o) => acc + o.enduido_kg, 0),
  masilla_kg_sold: ORDERS
    .filter(o => o.order_date.startsWith('2025-03') && o.status !== 'anulado')
    .reduce((acc, o) => acc + o.masilla_kg, 0),
}

// Helper functions
export function getOrdersByStatus(status: Order['status']): Order[] {
  return ORDERS.filter(o => o.status === status)
}

export function getOrdersByPaymentStatus(status: Order['payment_status']): Order[] {
  return ORDERS.filter(o => o.payment_status === status && o.status !== 'anulado')
}

export function getUpcomingExpenses(): Expense[] {
  return EXPENSES.filter(e => e.due_date && e.status === 'activo')
    .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))
}

export function getRecurrentExpenses(): Expense[] {
  return EXPENSES.filter(e => e.expense_type === 'recurrente' && e.status === 'activo')
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatWeight(kg: number): string {
  return `${kg.toLocaleString('es-UY')} kg`
}
