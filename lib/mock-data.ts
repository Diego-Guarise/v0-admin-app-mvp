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
// Products - Enduido interior y Masilla para yeso
// ============================================
export const PRODUCTS: Product[] = [
  { id: 'prod-1', name: 'Enduido Interior', type: 'enduido', active: true },
  { id: 'prod-2', name: 'Masilla para Yeso', type: 'masilla', active: true },
]

// ============================================
// Presentations - Presentaciones reales del mercado uruguayo
// ============================================
export const PRESENTATIONS: Presentation[] = [
  // Bolsas
  { id: 'pres-1', name: 'Bolsa 1 kg', type: 'bolsa', weight_kg: 1, active: true },
  { id: 'pres-2', name: 'Bolsa 5 kg', type: 'bolsa', weight_kg: 5, active: true },
  { id: 'pres-3', name: 'Bolsa 10 kg', type: 'bolsa', weight_kg: 10, active: true },
  { id: 'pres-4', name: 'Bolsa 25 kg', type: 'bolsa', weight_kg: 25, active: true },
  // Potes
  { id: 'pres-5', name: 'Pote 1.5 kg', type: 'pote', weight_kg: 1.5, active: true },
  { id: 'pres-6', name: 'Pote 4 kg', type: 'pote', weight_kg: 4, active: true },
  { id: 'pres-7', name: 'Pote 8 kg', type: 'pote', weight_kg: 8, active: true },
  { id: 'pres-8', name: 'Pote 20 kg', type: 'pote', weight_kg: 20, active: true },
]

// ============================================
// Expense Categories - Categorías alineadas con el negocio
// ============================================
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'cat-1', name: 'Materia prima', subcategories: ['Cal hidratada', 'Yeso', 'Aditivos', 'Otros insumos'] },
  { id: 'cat-2', name: 'Envases', subcategories: ['Bolsas', 'Potes', 'Tapas'] },
  { id: 'cat-3', name: 'Etiquetas / marca', subcategories: ['Etiquetas', 'Impresión', 'Diseño'] },
  { id: 'cat-4', name: 'Servicios', subcategories: ['Internet', 'Teléfono', 'Software'] },
  { id: 'cat-5', name: 'Alquiler', subcategories: ['Nave industrial', 'Depósito'] },
  { id: 'cat-6', name: 'Luz', subcategories: ['UTE'] },
  { id: 'cat-7', name: 'Agua', subcategories: ['OSE'] },
  { id: 'cat-8', name: 'Sueldos', subcategories: ['Producción', 'Administración', 'Ventas'] },
  { id: 'cat-9', name: 'Logística / fletes', subcategories: ['Combustible', 'Peajes', 'Envíos terceros'] },
  { id: 'cat-10', name: 'Mantenimiento', subcategories: ['Maquinaria', 'Vehículos', 'Instalaciones'] },
  { id: 'cat-11', name: 'Impuestos / trámites', subcategories: ['BPS', 'DGI', 'Habilitaciones', 'Otros'] },
  { id: 'cat-12', name: 'Otros', subcategories: [] },
]

// ============================================
// Clients - Clientes realistas de Uruguay
// ============================================
export const CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Martín Rodríguez',
    company: 'Barraca La Colonial',
    phone: '099 234 567',
    email: 'ventas@lacolonial.com.uy',
    address: 'Av. Gral. Flores 4521, Montevideo',
    notes: 'Cliente desde 2022. Pago puntual a 30 días.',
    active: true,
    created_at: '2022-03-15T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: 'cli-2',
    name: 'Gabriela Méndez',
    company: 'Distribuidora del Este',
    phone: '098 456 789',
    email: 'compras@disteste.com.uy',
    address: 'Ruta 9 km 45, Maldonado',
    notes: 'Distribuidor exclusivo zona este. Pedidos quincenales.',
    active: true,
    created_at: '2022-06-20T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'cli-3',
    name: 'Jorge Fernández',
    company: 'Ferretería El Yunque',
    phone: '094 321 654',
    email: 'elyunque@adinet.com.uy',
    address: 'Sarandí 234, Durazno',
    notes: 'Pedidos mensuales. Prefiere entregas martes/jueves.',
    active: true,
    created_at: '2023-01-10T10:00:00Z',
    updated_at: '2025-02-20T10:00:00Z',
  },
  {
    id: 'cli-4',
    name: 'Carolina Suárez',
    company: 'Pinturas del Norte',
    phone: '091 789 456',
    email: 'carolina@pinturasnorte.com.uy',
    address: 'Av. Salto 1200, Paysandú',
    notes: 'Distribuidor zona norte. Buenos volúmenes.',
    active: true,
    created_at: '2023-04-05T10:00:00Z',
    updated_at: '2025-02-10T10:00:00Z',
  },
  {
    id: 'cli-5',
    name: 'Andrés Cardozo',
    company: 'Construcciones AC',
    phone: '097 654 321',
    email: 'andres@construccionesac.com.uy',
    address: 'Camino Maldonado 5678, Montevideo',
    notes: 'Empresa constructora. Pedidos por obra.',
    active: true,
    created_at: '2023-08-15T10:00:00Z',
    updated_at: '2025-01-28T10:00:00Z',
  },
  {
    id: 'cli-6',
    name: 'Patricia Lima',
    phone: '099 111 222',
    email: 'patricia.lima@gmail.com',
    address: 'Bvar. España 2345, Montevideo',
    notes: 'Consumidor final. Proyectos de remodelación.',
    active: true,
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-11-15T10:00:00Z',
  },
  {
    id: 'cli-7',
    name: 'Roberto Acosta',
    company: 'Barraca San José',
    phone: '098 333 444',
    email: 'roberto@barracasanjose.com.uy',
    address: '25 de Mayo 567, San José de Mayo',
    notes: 'Barraca tradicional. Pedidos mensuales.',
    active: false,
    created_at: '2022-09-01T10:00:00Z',
    updated_at: '2024-06-15T10:00:00Z',
  },
]

// ============================================
// Orders - Pedidos realistas con cantidades coherentes
// ============================================
const orderItemsData: Record<string, OrderItem[]> = {
  'ord-1': [
    {
      id: 'item-ord-1-1',
      order_id: 'ord-1',
      product_id: 'prod-1',
      product: PRODUCTS[0],
      presentation_id: 'pres-4',
      presentation: PRESENTATIONS[3], // Bolsa 25 kg
      with_brand: true,
      quantity: 40,
      unit_price: 185,
      subtotal: 7400,
    },
    {
      id: 'item-ord-1-2',
      order_id: 'ord-1',
      product_id: 'prod-2',
      product: PRODUCTS[1],
      presentation_id: 'pres-3',
      presentation: PRESENTATIONS[2], // Bolsa 10 kg
      with_brand: true,
      quantity: 20,
      unit_price: 95,
      subtotal: 1900,
    },
  ],
  'ord-2': [
    {
      id: 'item-ord-2-1',
      order_id: 'ord-2',
      product_id: 'prod-1',
      product: PRODUCTS[0],
      presentation_id: 'pres-8',
      presentation: PRESENTATIONS[7], // Pote 20 kg
      with_brand: false,
      quantity: 30,
      unit_price: 295,
      subtotal: 8850,
    },
  ],
  'ord-3': [
    {
      id: 'item-ord-3-1',
      order_id: 'ord-3',
      product_id: 'prod-1',
      product: PRODUCTS[0],
      presentation_id: 'pres-2',
      presentation: PRESENTATIONS[1], // Bolsa 5 kg
      with_brand: true,
      quantity: 50,
      unit_price: 52,
      subtotal: 2600,
    },
    {
      id: 'item-ord-3-2',
      order_id: 'ord-3',
      product_id: 'prod-2',
      product: PRODUCTS[1],
      presentation_id: 'pres-6',
      presentation: PRESENTATIONS[5], // Pote 4 kg
      with_brand: true,
      quantity: 24,
      unit_price: 78,
      subtotal: 1872,
    },
  ],
  'ord-4': [
    {
      id: 'item-ord-4-1',
      order_id: 'ord-4',
      product_id: 'prod-1',
      product: PRODUCTS[0],
      presentation_id: 'pres-4',
      presentation: PRESENTATIONS[3], // Bolsa 25 kg
      with_brand: true,
      quantity: 60,
      unit_price: 175,
      subtotal: 10500,
    },
    {
      id: 'item-ord-4-2',
      order_id: 'ord-4',
      product_id: 'prod-2',
      product: PRODUCTS[1],
      presentation_id: 'pres-4',
      presentation: PRESENTATIONS[3], // Bolsa 25 kg
      with_brand: true,
      quantity: 20,
      unit_price: 165,
      subtotal: 3300,
    },
  ],
  'ord-5': [
    {
      id: 'item-ord-5-1',
      order_id: 'ord-5',
      product_id: 'prod-1',
      product: PRODUCTS[0],
      presentation_id: 'pres-7',
      presentation: PRESENTATIONS[6], // Pote 8 kg
      with_brand: false,
      quantity: 15,
      unit_price: 125,
      subtotal: 1875,
    },
  ],
  'ord-6': [
    {
      id: 'item-ord-6-1',
      order_id: 'ord-6',
      product_id: 'prod-1',
      product: PRODUCTS[0],
      presentation_id: 'pres-4',
      presentation: PRESENTATIONS[3], // Bolsa 25 kg
      with_brand: true,
      quantity: 80,
      unit_price: 185,
      subtotal: 14800,
    },
    {
      id: 'item-ord-6-2',
      order_id: 'ord-6',
      product_id: 'prod-2',
      product: PRODUCTS[1],
      presentation_id: 'pres-3',
      presentation: PRESENTATIONS[2], // Bolsa 10 kg
      with_brand: true,
      quantity: 30,
      unit_price: 95,
      subtotal: 2850,
    },
  ],
  'ord-7': [
    {
      id: 'item-ord-7-1',
      order_id: 'ord-7',
      product_id: 'prod-1',
      product: PRODUCTS[0],
      presentation_id: 'pres-5',
      presentation: PRESENTATIONS[4], // Pote 1.5 kg
      with_brand: true,
      quantity: 12,
      unit_price: 38,
      subtotal: 456,
    },
    {
      id: 'item-ord-7-2',
      order_id: 'ord-7',
      product_id: 'prod-2',
      product: PRODUCTS[1],
      presentation_id: 'pres-5',
      presentation: PRESENTATIONS[4], // Pote 1.5 kg
      with_brand: true,
      quantity: 6,
      unit_price: 42,
      subtotal: 252,
    },
  ],
}

// Calculate kg for each order
const calculateKg = (items: OrderItem[]) => {
  let enduido = 0
  let masilla = 0
  items.forEach(item => {
    const kg = item.quantity * item.presentation.weight_kg
    if (item.product.type === 'enduido') {
      enduido += kg
    } else {
      masilla += kg
    }
  })
  return { enduido, masilla }
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
    notes: 'Entregar antes de las 14hs.',
    items: orderItemsData['ord-1'],
    subtotal: 9300,
    iva: 2046,
    total: 11346,
    enduido_kg: calculateKg(orderItemsData['ord-1']).enduido,
    masilla_kg: calculateKg(orderItemsData['ord-1']).masilla,
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
    items: orderItemsData['ord-2'],
    subtotal: 8850,
    iva: 1947,
    total: 10797,
    enduido_kg: calculateKg(orderItemsData['ord-2']).enduido,
    masilla_kg: calculateKg(orderItemsData['ord-2']).masilla,
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
    notes: 'Primer pedido del año. Verificar dirección.',
    items: orderItemsData['ord-3'],
    subtotal: 4472,
    iva: 984,
    total: 5456,
    enduido_kg: calculateKg(orderItemsData['ord-3']).enduido,
    masilla_kg: calculateKg(orderItemsData['ord-3']).masilla,
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
    items: orderItemsData['ord-4'],
    subtotal: 13800,
    iva: 3036,
    total: 16836,
    enduido_kg: calculateKg(orderItemsData['ord-4']).enduido,
    masilla_kg: calculateKg(orderItemsData['ord-4']).masilla,
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
    notes: 'Obra en Pocitos. Contactar con el capataz.',
    items: orderItemsData['ord-5'],
    subtotal: 1875,
    iva: 412,
    total: 2287,
    enduido_kg: calculateKg(orderItemsData['ord-5']).enduido,
    masilla_kg: calculateKg(orderItemsData['ord-5']).masilla,
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
    items: orderItemsData['ord-6'],
    subtotal: 17650,
    iva: 3883,
    total: 21533,
    enduido_kg: calculateKg(orderItemsData['ord-6']).enduido,
    masilla_kg: calculateKg(orderItemsData['ord-6']).masilla,
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
    promised_date: '2025-03-11',
    client_id: 'cli-6',
    client: CLIENTS[5],
    price_category: 'consumidor_final',
    notes: 'Retira en fábrica.',
    items: orderItemsData['ord-7'],
    subtotal: 708,
    iva: 156,
    total: 864,
    enduido_kg: calculateKg(orderItemsData['ord-7']).enduido,
    masilla_kg: calculateKg(orderItemsData['ord-7']).masilla,
    status: 'finalizado',
    payment_status: 'parcial',
    commission_status: 'excluido',
    manual_price: true,
    created_at: '2025-03-09T11:00:00Z',
    updated_at: '2025-03-10T15:00:00Z',
  },
]

// ============================================
// Expenses - Gastos realistas para negocio en Uruguay
// ============================================
export const EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    date: '2025-03-01',
    accounting_month: '2025-03',
    concept: 'Compra cal hidratada (2 pallets)',
    category_id: 'cat-1',
    category: EXPENSE_CATEGORIES[0],
    subcategory: 'Cal hidratada',
    supplier: 'Cales del Plata S.A.',
    amount: 28500,
    amount_without_iva: 23360.66,
    iva: 5139.34,
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
    concept: 'Alquiler nave industrial - Marzo',
    category_id: 'cat-5',
    category: EXPENSE_CATEGORIES[4],
    subcategory: 'Nave industrial',
    supplier: 'Inmobiliaria Rodríguez',
    amount: 45000,
    amount_without_iva: 45000,
    iva: 0,
    has_invoice: false,
    notes: 'Contrato renovado hasta dic 2025',
    expense_type: 'recurrente',
    status: 'activo',
    recurrence_frequency: 'mensual',
    estimated_day: 1,
    estimated_amount: 45000,
    created_at: '2025-03-01T08:00:00Z',
    updated_at: '2025-03-01T08:00:00Z',
  },
  {
    id: 'exp-3',
    date: '2025-03-05',
    accounting_month: '2025-03',
    concept: 'Factura UTE - Febrero',
    category_id: 'cat-6',
    category: EXPENSE_CATEGORIES[5],
    subcategory: 'UTE',
    supplier: 'UTE',
    amount: 18500,
    amount_without_iva: 15163.93,
    iva: 3336.07,
    has_invoice: true,
    expense_type: 'recurrente',
    status: 'activo',
    recurrence_frequency: 'mensual',
    estimated_day: 5,
    estimated_amount: 17000,
    created_at: '2025-03-05T09:00:00Z',
    updated_at: '2025-03-05T09:00:00Z',
  },
  {
    id: 'exp-4',
    date: '2025-03-06',
    accounting_month: '2025-03',
    concept: 'Combustible camión (500 lts)',
    category_id: 'cat-9',
    category: EXPENSE_CATEGORIES[8],
    subcategory: 'Combustible',
    supplier: 'ANCAP',
    amount: 12500,
    amount_without_iva: 10245.90,
    iva: 2254.10,
    has_invoice: true,
    expense_type: 'unico',
    status: 'activo',
    created_at: '2025-03-06T14:00:00Z',
    updated_at: '2025-03-06T14:00:00Z',
  },
  {
    id: 'exp-5',
    date: '2025-03-07',
    accounting_month: '2025-03',
    concept: 'Bolsas 25kg (1000 unidades)',
    category_id: 'cat-2',
    category: EXPENSE_CATEGORIES[1],
    subcategory: 'Bolsas',
    supplier: 'Envases Plásticos Uruguay S.A.',
    amount: 15800,
    amount_without_iva: 12950.82,
    iva: 2849.18,
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
    concept: 'Cheque diferido - Yeso (5 toneladas)',
    category_id: 'cat-1',
    category: EXPENSE_CATEGORIES[0],
    subcategory: 'Yeso',
    supplier: 'Yesos del Uruguay',
    amount: 42000,
    amount_without_iva: 34426.23,
    iva: 7573.77,
    has_invoice: true,
    expense_type: 'diferido',
    status: 'activo',
    due_date: '2025-04-15',
    payment_method: 'Cheque',
    check_number: 'CH-00234',
    created_at: '2025-03-08T10:00:00Z',
    updated_at: '2025-03-08T10:00:00Z',
  },
  {
    id: 'exp-7',
    date: '2025-03-10',
    accounting_month: '2025-03',
    concept: 'Sueldos personal producción - Marzo',
    category_id: 'cat-8',
    category: EXPENSE_CATEGORIES[7],
    subcategory: 'Producción',
    amount: 85000,
    amount_without_iva: 85000,
    iva: 0,
    has_invoice: false,
    notes: '2 operarios tiempo completo',
    expense_type: 'recurrente',
    status: 'activo',
    recurrence_frequency: 'mensual',
    estimated_day: 25,
    estimated_amount: 85000,
    created_at: '2025-03-10T08:00:00Z',
    updated_at: '2025-03-10T08:00:00Z',
  },
  {
    id: 'exp-8',
    date: '2025-02-28',
    accounting_month: '2025-02',
    concept: 'Service camión reparto',
    category_id: 'cat-10',
    category: EXPENSE_CATEGORIES[9],
    subcategory: 'Vehículos',
    supplier: 'Taller Mecánico González',
    amount: 8500,
    amount_without_iva: 6967.21,
    iva: 1532.79,
    has_invoice: true,
    expense_type: 'unico',
    status: 'activo',
    created_at: '2025-02-28T16:00:00Z',
    updated_at: '2025-02-28T16:00:00Z',
  },
  {
    id: 'exp-9',
    date: '2025-03-03',
    accounting_month: '2025-03',
    concept: 'Factura OSE - Febrero',
    category_id: 'cat-7',
    category: EXPENSE_CATEGORIES[6],
    subcategory: 'OSE',
    supplier: 'OSE',
    amount: 2800,
    amount_without_iva: 2295.08,
    iva: 504.92,
    has_invoice: true,
    expense_type: 'recurrente',
    status: 'activo',
    recurrence_frequency: 'mensual',
    estimated_day: 3,
    estimated_amount: 2500,
    created_at: '2025-03-03T10:00:00Z',
    updated_at: '2025-03-03T10:00:00Z',
  },
  {
    id: 'exp-10',
    date: '2025-03-12',
    accounting_month: '2025-03',
    concept: 'Aporte BPS - Febrero',
    category_id: 'cat-11',
    category: EXPENSE_CATEGORIES[10],
    subcategory: 'BPS',
    supplier: 'BPS',
    amount: 22000,
    amount_without_iva: 22000,
    iva: 0,
    has_invoice: true,
    expense_type: 'recurrente',
    status: 'activo',
    recurrence_frequency: 'mensual',
    estimated_day: 12,
    estimated_amount: 22000,
    created_at: '2025-03-12T09:00:00Z',
    updated_at: '2025-03-12T09:00:00Z',
  },
  {
    id: 'exp-11',
    date: '2025-03-15',
    accounting_month: '2025-03',
    concept: 'Etiquetas impresas (5000 unidades)',
    category_id: 'cat-3',
    category: EXPENSE_CATEGORIES[2],
    subcategory: 'Etiquetas',
    supplier: 'Imprenta Gráfica Sur',
    amount: 6500,
    amount_without_iva: 5327.87,
    iva: 1172.13,
    has_invoice: true,
    expense_type: 'unico',
    status: 'activo',
    created_at: '2025-03-15T11:00:00Z',
    updated_at: '2025-03-15T11:00:00Z',
  },
  {
    id: 'exp-12',
    date: '2025-03-01',
    accounting_month: '2025-03',
    concept: 'Pago diferido - Potes plásticos',
    category_id: 'cat-2',
    category: EXPENSE_CATEGORIES[1],
    subcategory: 'Potes',
    supplier: 'Plásticos del Uruguay',
    amount: 18000,
    amount_without_iva: 14754.10,
    iva: 3245.90,
    has_invoice: true,
    expense_type: 'diferido',
    status: 'activo',
    due_date: '2025-03-30',
    payment_method: 'Transferencia',
    created_at: '2025-03-01T12:00:00Z',
    updated_at: '2025-03-01T12:00:00Z',
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

// Calculate client statistics
export function getClientStats(clientId: string) {
  const clientOrders = ORDERS.filter(o => o.client_id === clientId && o.status !== 'anulado')
  return {
    totalOrders: clientOrders.length,
    totalPurchased: clientOrders.reduce((acc, o) => acc + o.total, 0),
    enduidoKg: clientOrders.reduce((acc, o) => acc + o.enduido_kg, 0),
    masillaKg: clientOrders.reduce((acc, o) => acc + o.masilla_kg, 0),
    lastOrderDate: clientOrders.length > 0 
      ? clientOrders.sort((a, b) => b.order_date.localeCompare(a.order_date))[0].order_date 
      : null,
  }
}

// Get client orders
export function getClientOrders(clientId: string): Order[] {
  return ORDERS.filter(o => o.client_id === clientId)
    .sort((a, b) => b.order_date.localeCompare(a.order_date))
}
