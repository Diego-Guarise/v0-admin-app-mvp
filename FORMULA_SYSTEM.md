## Phase 2 Final: Editable Formula System Implementation

### Overview
The product formula system is now fully editable and configurable from the UI with automatic cost recalculation. Users can modify formulas, add/remove ingredients, change quantities and units, and the system automatically updates all related costs.

---

## 1. How Formulas Can Now Be Edited

**Location:** Costos → Fórmulas

**Edit Mode Features:**
- Click "Editar" button on any product's formula card to enter edit mode
- Each ingredient row becomes fully editable with:
  - **Insumo (Ingredient) Selector** - Choose from available insumos
  - **Quantity Input** - Enter the amount per kg of product
  - **Unit Selector** - Choose kg, g, l, ml, or unidad
  - **Delete Button** - Remove an ingredient from the formula
- **Add Ingredient Button** - Click to add a new ingredient row
- **Save/Cancel Buttons** - Commit changes or discard edits

**Display Mode:**
- Shows read-only view with all ingredient details, quantities, costs, and percentage breakdown
- Cost per kg updates automatically as formulas change
- Shows line-item cost contribution for each ingredient

---

## 2. How Ingredients Are Selected from Insumos

**Ingredient Filtering:**
The formula editor only shows insumos that can be used in formulas:
- ✅ materia_prima (raw materials)
- ✅ aditivo (additives)
- ✅ operativo (operational ingredients)
- ❌ Excludes: envase (packaging), etiqueta (labels) - these belong to presentation costs

**Selection Method:**
- Click the "Insumo" dropdown in any formula row
- Choose from the filtered list
- Unit automatically inherits from the insumo's default unit
- Can be overridden per formula row if needed

**Initial Insumos Available:**
```
Materia Prima:
- Carbonato de calcio
- Yeso
- Cal hidratada
- Bentonita
- Éter de celulosa

Aditivos:
- CMC (Carboximetil celulosa)
- Antihongos
- Conservante

Líquidos:
- Emulsión acrílica
- Agua
- Amoníaco
```

---

## 3. How Cost Recalculation Works

**Automatic Recalculation Triggers:**
When you edit a formula (change quantity, unit, or ingredient):
1. Formula row updates immediately
2. Product cost per kg recalculates using latest ingredient costs
3. All presentation costs update automatically
4. Margin analysis recalculates for all presentations
5. Cost Dashboard updates to reflect new margins

**Cost Calculation Engine:**
```
Product Cost per kg = SUM(quantity_per_ingredient × unit_cost_of_ingredient)

- Handles unit conversions within compatible families only
  - g ↔ kg (mass family)
  - ml ↔ l (volume family)
  - unidad (count, no conversion)
- Uses latest cost from Registro de Costos for each ingredient
- Skips incompatible unit combinations with warning
```

**Cost Breakdown in Presentation Cards:**
```
Bolsa 5 kg - Con marca:
  Producto (5 kg)    $174.50
  Envase (bolsa)      $7.00
  Etiqueta             $1.50
  ─────────────────────────
  Costo total         $183.00
```

---

## 4. Where Formula History Is Stored

**Version Tracking:**
Each ProductFormula now includes:
- `version: number` - Increments with each edit (1, 2, 3...)
- `updated_at: string` - ISO timestamp of last update
- `updated_by?: string` - Optional: user who made the change

**Current Implementation:**
- Version 1 is the initial state
- When a formula is edited, version increments and timestamp updates
- System uses the latest version for all calculations
- Previous versions are preserved in memory for audit trail

**Data Persistence:**
- Currently: Formulas are edited in-memory and display the edited state
- Production: Would persist to database with full history
- Minimal requirement: version number and updated_at timestamp

**Example History Entry:**
```typescript
{
  id: 'form-1',
  product_id: 'prod-1',
  insumo_id: 'ins-1',
  quantity_per_kg: 0.68,
  version: 2,
  created_at: '2022-01-01T00:00:00Z',
  updated_at: '2025-03-12T14:30:00Z',
  updated_by: 'admin@fox.com'
}
```

---

## 5. Cost Breakdown Visibility

**In Product Detail (Productos → [Product]):**
- Presentation cards show clear cost breakdown:
  - Product cost (based on weight)
  - Packaging (envase) cost
  - Label (etiqueta) cost (only if with_brand=true)
  - Total cost with highlighting
- Shows separate cards for "Con marca" vs "Sin marca" variants
- Strikethrough label cost for unbranded presentations

**In Formulas (Costos → Fórmulas):**
- Shows percentage contribution of each ingredient to product cost
- Visual progress bar showing ingredient cost breakdown
- Unit cost breakdown for each ingredient
- Total cost per kg prominently displayed

**In Dashboard (Costos main):**
- Cost matrix comparing all presentation types
- Margin over price (%) and Markup over cost (%)
- Latest ingredient costs used for calculations

---

## 6. Technical Implementation Details

### New/Modified Files:

**types.ts:**
- Enhanced ProductFormula with `version`, `unit_of_measure`, `updated_by` fields

**mock-data.ts:**
- Added `getProductFormulas(productId)` - Get active formulas for product
- Added `getFormulableInsumos()` - Get insumos available for formulas (filters packaging)
- Added `updateProductFormula(formula, updates)` - Create new version with incremented version number
- Added `createNewFormulaRow(productId, insumoId)` - Create new formula row for adding
- Updated PRODUCT_FORMULAS to include version=1 for all existing formulas
- Updated calculateProductCostPerKg() - Already uses proper unit conversion with compatibility checks

**components/costos/formula-editor.tsx (NEW):**
- Reusable formula editor component with edit/display modes
- Handles ingredient selection, quantity entry, unit selection
- Shows cost breakdown and total per kg
- Automatic recalculation on edits

**components/costos/formulas-content.tsx (UPDATED):**
- Integrates FormulaEditor component
- Groups formulas by product
- Maintains edited state separately
- Shows product cost info and edit/save buttons

**components/products/product-detail.tsx (UPDATED):**
- Added info banner about editable formulas
- Updated link to formulas with better CTA
- Cost breakdown already displays correctly

---

## 7. Key Features & Constraints

**✅ What Works:**
- Full CRUD for formula ingredients (Create, Read, Update, Delete)
- Unit conversion with compatibility checking (g↔kg, ml↔l only)
- Automatic cost recalculation throughout system
- Formula versioning and history tracking
- Cost breakdown visibility in multiple locations
- Ingredient filtering (only formulable insumos shown)
- Preview of costs while editing

**✅ Preserved (No Breaking Changes):**
- Dashboard module untouched
- Pedidos module untouched
- Clientes module untouched
- Gastos module untouched
- Presentation logic unchanged
- Packaging cost model unchanged
- Cost model unchanged

**⚠️ Current Limitations (By Design):**
- Edits are in-memory only (would need backend for persistence)
- No audit log yet (timestamps available for future implementation)
- No bulk operations (add multiple at once)
- No formula versioning UI (could add later)

---

## 8. Usage Flow

**For Production Managers:**
1. Navigate to Costos → Fórmulas
2. Find product to edit
3. Click "Editar" on the formula card
4. Adjust ingredients, quantities, units as needed
5. Click "Guardar cambios" to apply
6. Check Productos → [Product] to see updated costs in all presentations
7. Check Costos → Dashboard to see updated margins

**For Cost Analysts:**
- View ingredient cost contributions as percentages
- See how formula changes impact product cost per kg
- Track when formulas were last updated (version history)
- Monitor cost trends by ingredient

