import type { 
  Product, 
  Presentation, 
  Client, 
  Order, 
  OrderItem,
  OrderStatus,
  PaymentStatus,
  Expense,
  ExpenseCategory,
  ExpenseStatus,
  DashboardStats,
  IngredientInput,
  IngredientCost,
  ProductFormula,
  calculateIngredientCostIVA
} from './types'

// ============================================
// Products - Enduido interior y Masilla para yeso
// ============================================
export const PRODUCTS: Product[] = [
  { 
    id: 'prod-1', 
    name: 'Enduido Interior', 
    type: 'enduido', 
    description: 'Enduido para interiores, ideal para preparar superficies antes de pintar',
    active: true,
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  { 
    id: 'prod-2', 
    name: 'Masilla para Yeso', 
    type: 'masilla',
    description: 'Masilla para reparación y nivelación de superficies de yeso',
    active: true,
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
]

// ============================================
// Presentations - Catálogo exacto según especificación
// Bolsas: 1, 2, 5, 10, 20 kg
// Potes: 1.7, 7, 18 kg
// Cada uno con with_brand = true y with_brand = false
// ============================================
const PRESENTATION_WEIGHTS = {
  bolsa: [1, 2, 5, 10, 20],
  pote: [1.7, 7, 18]
}

function generatePresentations(): Presentation[] {
  const presentations: Presentation[] = []
  let idCounter = 1
  
  for (const product of PRODUCTS) {
    // Bolsas
    for (const weight of PRESENTATION_WEIGHTS.bolsa) {
      // With brand
      presentations.push({
        id: `pres-${idCounter++}`,
        product_id: product.id,
        name: `Bolsa ${weight} kg - Con marca`,
        type: 'bolsa',
        weight_kg: weight,
        with_brand: true,
        active: true,
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      })
      // Without brand
      presentations.push({
        id: `pres-${idCounter++}`,
        product_id: product.id,
        name: `Bolsa ${weight} kg - Sin marca`,
        type: 'bolsa',
        weight_kg: weight,
        with_brand: false,
        active: true,
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      })
    }
    // Potes
    for (const weight of PRESENTATION_WEIGHTS.pote) {
      // With brand
      presentations.push({
        id: `pres-${idCounter++}`,
        product_id: product.id,
        name: `Pote ${weight} kg - Con marca`,
        type: 'pote',
        weight_kg: weight,
        with_brand: true,
        active: true,
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      })
      // Without brand
      presentations.push({
        id: `pres-${idCounter++}`,
        product_id: product.id,
        name: `Pote ${weight} kg - Sin marca`,
        type: 'pote',
        weight_kg: weight,
        with_brand: false,
        active: true,
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      })
    }
  }
  
  return presentations
}

export const PRESENTATIONS: Presentation[] = generatePresentations()

// Helper to get presentation by product, type, weight and brand
export function getPresentation(
  productId: string, 
  type: 'bolsa' | 'pote', 
  weightKg: number, 
  withBrand: boolean
): Presentation | undefined {
  return PRESENTATIONS.find(p => 
    p.product_id === productId && 
    p.type === type && 
    p.weight_kg === weightKg && 
    p.with_brand === withBrand
  )
}

// ============================================
// Ingredient Inputs (Insumos)
// ============================================
export const INGREDIENT_INPUTS: IngredientInput[] = [
  // Materias primas
  {
    id: 'ins-1',
    name: 'Carbonato de calcio',
    category: 'materia_prima',
    unit_of_measure: 'kg',
    description: 'Carga mineral principal',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ins-2',
    name: 'CMC (Carboximetilcelulosa)',
    category: 'aditivo',
    unit_of_measure: 'kg',
    description: 'Espesante y estabilizante',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ins-3',
    name: 'Bentonita',
    category: 'aditivo',
    unit_of_measure: 'kg',
    description: 'Arcilla para mejorar textura',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ins-4',
    name: 'Emulsión acrílica',
    category: 'materia_prima',
    unit_of_measure: 'l',
    description: 'Ligante principal',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ins-5',
    name: 'Agua',
    category: 'materia_prima',
    unit_of_measure: 'l',
    description: 'Solvente',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ins-6',
    name: 'Yeso',
    category: 'materia_prima',
    unit_of_measure: 'kg',
    description: 'Base para masilla',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ins-7',
    name: 'Cal hidratada',
    category: 'materia_prima',
    unit_of_measure: 'kg',
    description: 'Mejora trabajabilidad',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ins-8',
    name: 'Retardador de fraguado',
    category: 'aditivo',
    unit_of_measure: 'g',
    description: 'Control de tiempo de secado',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  // Envases
  {
    id: 'ins-9',
    name: 'Bolsa plástica 1 kg',
    category: 'envase',
    unit_of_measure: 'unidad',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ins-10',
    name: 'Bolsa plástica 2 kg',
    category: 'envase',
    unit_of_measure: 'unidad',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ins-11',
    name: 'Bolsa plástica 5 kg',
    category: 'envase',
    unit_of_measure: 'unidad',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ins-12',
    name: 'Bolsa plástica 10 kg',
    category: 'envase',
    unit_of_measure: 'unidad',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ins-13',
    name: 'Bolsa plástica 20 kg',
    category: 'envase',
    unit_of_measure: 'unidad',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ins-14',
    name: 'Pote plástico 1.7 kg',
    category: 'envase',
    unit_of_measure: 'unidad',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ins-15',
    name: 'Pote plástico 7 kg',
    category: 'envase',
    unit_of_measure: 'unidad',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ins-16',
    name: 'Pote plástico 18 kg',
    category: 'envase',
    unit_of_measure: 'unidad',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  // Etiquetas
  {
    id: 'ins-17',
    name: 'Etiqueta Enduido 1-5 kg',
    category: 'etiqueta',
    unit_of_measure: 'unidad',
    description: 'Etiqueta autoadhesiva para presentaciones pequeñas',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ins-18',
    name: 'Etiqueta Enduido 10-20 kg',
    category: 'etiqueta',
    unit_of_measure: 'unidad',
    description: 'Etiqueta autoadhesiva para presentaciones grandes',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ins-19',
    name: 'Etiqueta Masilla 1-5 kg',
    category: 'etiqueta',
    unit_of_measure: 'unidad',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ins-20',
    name: 'Etiqueta Masilla 10-20 kg',
    category: 'etiqueta',
    unit_of_measure: 'unidad',
    status: 'activo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
]

// ============================================
// Ingredient Costs (Costos de Insumo)
// Histórico de precios con IVA correctamente calculado
// ============================================
function createIngredientCost(
  id: string,
  insumo_id: string,
  date: string,
  provider: string,
  quantity: number,
  unit_of_measure: 'kg' | 'g' | 'l' | 'ml' | 'unidad',
  total_amount: number,
  has_invoice: boolean,
  notes?: string
): IngredientCost {
  const calculated = calculateIngredientCostIVA(total_amount, has_invoice, quantity)
  return {
    id,
    insumo_id,
    insumo: INGREDIENT_INPUTS.find(i => i.id === insumo_id),
    date,
    provider,
    quantity,
    unit_of_measure,
    total_amount,
    has_invoice,
    ...calculated,
    notes,
    created_at: date + 'T10:00:00Z',
    updated_at: date + 'T10:00:00Z'
  }
}

export const INGREDIENT_COSTS: IngredientCost[] = [
  // Carbonato de calcio - con factura
  createIngredientCost('ic-1', 'ins-1', '2025-02-01', 'Minera del Plata S.A.', 1000, 'kg', 8540, true, 'Bolsones de 25 kg x 40'),
  createIngredientCost('ic-2', 'ins-1', '2025-03-05', 'Minera del Plata S.A.', 1500, 'kg', 13200, true, 'Incremento de precio'),
  
  // CMC - con factura
  createIngredientCost('ic-3', 'ins-2', '2025-01-15', 'Químicos Industriales', 50, 'kg', 18300, true, 'Importado'),
  createIngredientCost('ic-4', 'ins-2', '2025-03-01', 'Químicos Industriales', 25, 'kg', 9760, true),
  
  // Bentonita - con factura
  createIngredientCost('ic-5', 'ins-3', '2025-02-10', 'Bentonitas del Uruguay', 200, 'kg', 4270, true),
  
  // Emulsión acrílica - con factura
  createIngredientCost('ic-6', 'ins-4', '2025-02-15', 'Pinturas Nacionales S.A.', 200, 'l', 24400, true, 'Tambores de 200L'),
  createIngredientCost('ic-7', 'ins-4', '2025-03-10', 'Pinturas Nacionales S.A.', 400, 'l', 46360, true, '2 tambores'),
  
  // Agua - sin factura (OSE)
  createIngredientCost('ic-8', 'ins-5', '2025-03-01', 'OSE', 5000, 'l', 250, false, 'Estimado mensual'),
  
  // Yeso - con factura
  createIngredientCost('ic-9', 'ins-6', '2025-02-05', 'Yesos del Uruguay', 500, 'kg', 7320, true),
  createIngredientCost('ic-10', 'ins-6', '2025-03-08', 'Yesos del Uruguay', 750, 'kg', 10980, true),
  
  // Cal hidratada - con factura
  createIngredientCost('ic-11', 'ins-7', '2025-02-20', 'Cales del Plata S.A.', 300, 'kg', 5490, true),
  
  // Retardador - con factura (cantidad en gramos)
  createIngredientCost('ic-12', 'ins-8', '2025-01-20', 'Aditivos Químicos', 5000, 'g', 3660, true, '5 kg'),
  
  // Bolsas - con factura
  createIngredientCost('ic-13', 'ins-9', '2025-02-01', 'Envases Plásticos Uruguay', 1000, 'unidad', 4880, true, 'Bolsa 1kg'),
  createIngredientCost('ic-14', 'ins-10', '2025-02-01', 'Envases Plásticos Uruguay', 1000, 'unidad', 5490, true, 'Bolsa 2kg'),
  createIngredientCost('ic-15', 'ins-11', '2025-02-01', 'Envases Plásticos Uruguay', 500, 'unidad', 3660, true, 'Bolsa 5kg'),
  createIngredientCost('ic-16', 'ins-12', '2025-02-01', 'Envases Plásticos Uruguay', 500, 'unidad', 4270, true, 'Bolsa 10kg'),
  createIngredientCost('ic-17', 'ins-13', '2025-02-01', 'Envases Plásticos Uruguay', 300, 'unidad', 3660, true, 'Bolsa 20kg'),
  
  // Potes - con factura
  createIngredientCost('ic-18', 'ins-14', '2025-02-15', 'Plásticos del Este', 200, 'unidad', 7320, true, 'Pote 1.7kg'),
  createIngredientCost('ic-19', 'ins-15', '2025-02-15', 'Plásticos del Este', 150, 'unidad', 10980, true, 'Pote 7kg'),
  createIngredientCost('ic-20', 'ins-16', '2025-02-15', 'Plásticos del Este', 100, 'unidad', 12200, true, 'Pote 18kg'),
  
  // Etiquetas - con factura
  createIngredientCost('ic-21', 'ins-17', '2025-02-10', 'Imprenta Gráfica S.R.L.', 2000, 'unidad', 4880, true, 'Etiqueta pequeña enduido'),
  createIngredientCost('ic-22', 'ins-18', '2025-02-10', 'Imprenta Gráfica S.R.L.', 1500, 'unidad', 5490, true, 'Etiqueta grande enduido'),
  createIngredientCost('ic-23', 'ins-19', '2025-02-10', 'Imprenta Gráfica S.R.L.', 1500, 'unidad', 3660, true, 'Etiqueta pequeña masilla'),
  createIngredientCost('ic-24', 'ins-20', '2025-02-10', 'Imprenta Gráfica S.R.L.', 1000, 'unidad', 3660, true, 'Etiqueta grande masilla'),
]

// ============================================
// Product Formulas (Fórmulas de Producto)
// Cantidad de insumo por kg de producto
// ============================================
export const PRODUCT_FORMULAS: ProductFormula[] = [
  // Fórmula Enduido Interior (prod-1)
  {
    id: 'form-1',
    product_id: 'prod-1',
    product: PRODUCTS[0],
    insumo_id: 'ins-1', // Carbonato de calcio
    insumo: INGREDIENT_INPUTS.find(i => i.id === 'ins-1'),
    quantity_per_kg: 0.65, // 650g por kg de producto
    notes: 'Carga principal',
    active: true,
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'form-2',
    product_id: 'prod-1',
    product: PRODUCTS[0],
    insumo_id: 'ins-2', // CMC
    insumo: INGREDIENT_INPUTS.find(i => i.id === 'ins-2'),
    quantity_per_kg: 0.015, // 15g por kg
    notes: 'Espesante',
    active: true,
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'form-3',
    product_id: 'prod-1',
    product: PRODUCTS[0],
    insumo_id: 'ins-3', // Bentonita
    insumo: INGREDIENT_INPUTS.find(i => i.id === 'ins-3'),
    quantity_per_kg: 0.02, // 20g por kg
    active: true,
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'form-4',
    product_id: 'prod-1',
    product: PRODUCTS[0],
    insumo_id: 'ins-4', // Emulsión acrílica
    insumo: INGREDIENT_INPUTS.find(i => i.id === 'ins-4'),
    quantity_per_kg: 0.08, // 80ml por kg
    notes: 'Ligante',
    active: true,
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'form-5',
    product_id: 'prod-1',
    product: PRODUCTS[0],
    insumo_id: 'ins-5', // Agua
    insumo: INGREDIENT_INPUTS.find(i => i.id === 'ins-5'),
    quantity_per_kg: 0.235, // 235ml por kg
    active: true,
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  
  // Fórmula Masilla para Yeso (prod-2)
  {
    id: 'form-6',
    product_id: 'prod-2',
    product: PRODUCTS[1],
    insumo_id: 'ins-6', // Yeso
    insumo: INGREDIENT_INPUTS.find(i => i.id === 'ins-6'),
    quantity_per_kg: 0.55, // 550g por kg
    notes: 'Base principal',
    active: true,
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'form-7',
    product_id: 'prod-2',
    product: PRODUCTS[1],
    insumo_id: 'ins-1', // Carbonato de calcio
    insumo: INGREDIENT_INPUTS.find(i => i.id === 'ins-1'),
    quantity_per_kg: 0.25, // 250g por kg
    notes: 'Carga secundaria',
    active: true,
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'form-8',
    product_id: 'prod-2',
    product: PRODUCTS[1],
    insumo_id: 'ins-7', // Cal hidratada
    insumo: INGREDIENT_INPUTS.find(i => i.id === 'ins-7'),
    quantity_per_kg: 0.05, // 50g por kg
    active: true,
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'form-9',
    product_id: 'prod-2',
    product: PRODUCTS[1],
    insumo_id: 'ins-2', // CMC
    insumo: INGREDIENT_INPUTS.find(i => i.id === 'ins-2'),
    quantity_per_kg: 0.008, // 8g por kg
    active: true,
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'form-10',
    product_id: 'prod-2',
    product: PRODUCTS[1],
    insumo_id: 'ins-8', // Retardador (en g, convertir a kg para cálculo)
    insumo: INGREDIENT_INPUTS.find(i => i.id === 'ins-8'),
    quantity_per_kg: 2, // 2g por kg (en gramos porque el insumo es en g)
    notes: 'Control de fraguado',
    active: true,
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'form-11',
    product_id: 'prod-2',
    product: PRODUCTS[1],
    insumo_id: 'ins-5', // Agua
    insumo: INGREDIENT_INPUTS.find(i => i.id === 'ins-5'),
    quantity_per_kg: 0.142, // 142ml por kg
    active: true,
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
]

// ============================================
// Helper: Get latest cost for an ingredient
// ============================================
export function getLatestIngredientCost(insumoId: string): IngredientCost | undefined {
  const costs = INGREDIENT_COSTS
    .filter(c => c.insumo_id === insumoId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return costs[0]
}

// ============================================
// Helper: Calculate cost per kg for a product
// ============================================
export function calculateProductCostPerKg(productId: string): number {
  const formulas = PRODUCT_FORMULAS.filter(f => f.product_id === productId && f.active)
  let totalCost = 0
  
  for (const formula of formulas) {
    const latestCost = getLatestIngredientCost(formula.insumo_id)
    if (latestCost) {
      // Handle unit conversion for ingredients measured in grams
      let unitCost = latestCost.unit_cost_without_iva
      if (latestCost.unit_of_measure === 'g') {
        // Convert g cost to kg cost for proper calculation
        unitCost = unitCost // Already per gram, quantity_per_kg is in grams
      }
      totalCost += formula.quantity_per_kg * unitCost
    }
  }
  
  return totalCost
}

// ============================================
// Helper: Get envase cost for a presentation
// ============================================
export function getEnvaseCost(presentationType: 'bolsa' | 'pote', weightKg: number): number {
  // Map weight to envase insumo
  const envaseMap: Record<string, string> = {
    'bolsa-1': 'ins-9',
    'bolsa-2': 'ins-10',
    'bolsa-5': 'ins-11',
    'bolsa-10': 'ins-12',
    'bolsa-20': 'ins-13',
    'pote-1.7': 'ins-14',
    'pote-7': 'ins-15',
    'pote-18': 'ins-16',
  }
  
  const key = `${presentationType}-${weightKg}`
  const insumoId = envaseMap[key]
  if (!insumoId) return 0
  
  const latestCost = getLatestIngredientCost(insumoId)
  return latestCost?.unit_cost_without_iva || 0
}

// ============================================
// Helper: Get etiqueta cost (only for with_brand)
// ============================================
export function getEtiquetaCost(productId: string, weightKg: number): number {
  // Determine if small or large etiqueta
  const isSmall = weightKg <= 5
  
  // Map product + size to etiqueta insumo
  const etiquetaMap: Record<string, string> = {
    'prod-1-small': 'ins-17',
    'prod-1-large': 'ins-18',
    'prod-2-small': 'ins-19',
    'prod-2-large': 'ins-20',
  }
  
  const key = `${productId}-${isSmall ? 'small' : 'large'}`
  const insumoId = etiquetaMap[key]
  if (!insumoId) return 0
  
  const latestCost = getLatestIngredientCost(insumoId)
  return latestCost?.unit_cost_without_iva || 0
}

// ============================================
// Expense Categories - Categorías alineadas con el negocio
// ============================================
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'cat-1', name: 'Materia prima', subcategories: ['Carbonato', 'Yeso', 'Cal', 'Aditivos', 'Otros insumos'] },
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
// Orders - Pedidos realistas usando el nuevo catálogo de presentaciones
// ============================================

// Helper to find presentation from the new catalog
function findPres(productId: string, type: 'bolsa' | 'pote', weight: number, withBrand: boolean): Presentation {
  const pres = PRESENTATIONS.find(p => 
    p.product_id === productId && 
    p.type === type && 
    p.weight_kg === weight && 
    p.with_brand === withBrand
  )
  return pres || PRESENTATIONS[0]
}

const orderItemsData: Record<string, OrderItem[]> = {
  'ord-1': [
    {
      id: 'item-ord-1-1',
      order_id: 'ord-1',
      product_id: 'prod-1',
      product: PRODUCTS[0],
      presentation_id: findPres('prod-1', 'bolsa', 20, true).id,
      presentation: findPres('prod-1', 'bolsa', 20, true),
      with_brand: true,
      quantity: 50,
      unit_price: 185,
      subtotal: 9250,
    },
    {
      id: 'item-ord-1-2',
      order_id: 'ord-1',
      product_id: 'prod-2',
      product: PRODUCTS[1],
      presentation_id: findPres('prod-2', 'bolsa', 10, true).id,
      presentation: findPres('prod-2', 'bolsa', 10, true),
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
      presentation_id: findPres('prod-1', 'pote', 18, false).id,
      presentation: findPres('prod-1', 'pote', 18, false),
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
      presentation_id: findPres('prod-1', 'bolsa', 5, true).id,
      presentation: findPres('prod-1', 'bolsa', 5, true),
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
      presentation_id: findPres('prod-2', 'pote', 7, true).id,
      presentation: findPres('prod-2', 'pote', 7, true),
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
      presentation_id: findPres('prod-1', 'bolsa', 20, true).id,
      presentation: findPres('prod-1', 'bolsa', 20, true),
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
      presentation_id: findPres('prod-2', 'bolsa', 20, true).id,
      presentation: findPres('prod-2', 'bolsa', 20, true),
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
      presentation_id: findPres('prod-1', 'pote', 7, false).id,
      presentation: findPres('prod-1', 'pote', 7, false),
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
      presentation_id: findPres('prod-1', 'bolsa', 20, true).id,
      presentation: findPres('prod-1', 'bolsa', 20, true),
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
      presentation_id: findPres('prod-2', 'bolsa', 10, true).id,
      presentation: findPres('prod-2', 'bolsa', 10, true),
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
      presentation_id: findPres('prod-1', 'pote', 1.7, true).id,
      presentation: findPres('prod-1', 'pote', 1.7, true),
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
      presentation_id: findPres('prod-2', 'pote', 1.7, true).id,
      presentation: findPres('prod-2', 'pote', 1.7, true),
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
    subtotal: 11150,
    iva: 2453,
    total: 13603,
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
    concept: 'Compra carbonato de calcio (1500 kg)',
    category_id: 'cat-1',
    category: EXPENSE_CATEGORIES[0],
    subcategory: 'Carbonato',
    supplier: 'Minera del Plata S.A.',
    amount: 13200,
    amount_without_iva: 10819.67,
    iva: 2380.33,
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
    concept: 'Bolsas 20 kg (300 unidades)',
    category_id: 'cat-2',
    category: EXPENSE_CATEGORIES[1],
    subcategory: 'Bolsas',
    supplier: 'Envases Plásticos Uruguay S.A.',
    amount: 3660,
    amount_without_iva: 3000,
    iva: 660,
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
    concept: 'Cheque diferido - Yeso (750 kg)',
    category_id: 'cat-1',
    category: EXPENSE_CATEGORIES[0],
    subcategory: 'Yeso',
    supplier: 'Yesos del Uruguay',
    amount: 10980,
    amount_without_iva: 9000,
    iva: 1980,
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
    supplier: 'Imprenta Gráfica S.R.L.',
    amount: 9150,
    amount_without_iva: 7500,
    iva: 1650,
    has_invoice: true,
    expense_type: 'unico',
    status: 'activo',
    created_at: '2025-03-15T11:00:00Z',
    updated_at: '2025-03-15T11:00:00Z',
  },
]

// ============================================
// Dashboard Stats - Estadísticas calculadas
// ============================================
export function calculateDashboardStats(month: string = '2025-03'): DashboardStats {
  const monthOrders = ORDERS.filter(o => o.order_date.startsWith(month) && o.status !== 'anulado')
  const monthExpenses = EXPENSES.filter(e => e.accounting_month === month && e.status === 'activo')
  
  return {
    monthly_sales_without_iva: monthOrders.reduce((sum, o) => sum + o.subtotal, 0),
    monthly_sales_with_iva: monthOrders.reduce((sum, o) => sum + o.total, 0),
    monthly_expenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    enduido_kg_sold: monthOrders.reduce((sum, o) => sum + o.enduido_kg, 0),
    masilla_kg_sold: monthOrders.reduce((sum, o) => sum + o.masilla_kg, 0),
  }
}

export const DASHBOARD_STATS: DashboardStats = calculateDashboardStats()

// ============================================
// Format Helpers
// ============================================
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCurrencyDecimal(amount: number): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatWeight(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} t`
  }
  return `${kg.toFixed(0)} kg`
}

export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ============================================
// Client Stats Helper
// ============================================
export function getClientStats(clientId: string) {
  const clientOrders = ORDERS.filter(o => o.client_id === clientId && o.status !== 'anulado')
  return {
    totalOrders: clientOrders.length,
    enduidoKg: clientOrders.reduce((sum, o) => sum + o.enduido_kg, 0),
    masillaKg: clientOrders.reduce((sum, o) => sum + o.masilla_kg, 0),
    totalPurchased: clientOrders.reduce((sum, o) => sum + o.total, 0),
  }
}

// ============================================
// Dashboard Helper Functions
// ============================================
export function getOrdersByStatus(status: OrderStatus) {
  return ORDERS.filter(o => o.status === status)
}

export function getOrdersByPaymentStatus(paymentStatus: PaymentStatus) {
  return ORDERS.filter(o => o.payment_status === paymentStatus)
}

export function getUpcomingExpenses() {
  const today = new Date()
  return EXPENSES.filter(e => {
    const expenseDate = new Date(e.date)
    return expenseDate > today && expenseDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  }).slice(0, 5)
}

export function getRecurrentExpenses() {
  return EXPENSES.filter(e => e.type === 'recurrente' && e.status === 'activo')
}
