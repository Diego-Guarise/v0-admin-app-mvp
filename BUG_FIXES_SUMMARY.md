# Bug Fixes Summary — FOX Admin Costos & Pedidos

## BUG 1: Costos - "Análisis de Márgenes" desincronizado

### Root Cause
- "Costo por Kilogramo" section was recalculating with persisted expenses (updated from Gastos)
- "Análisis de Márgenes" section was NOT recalculating because:
  1. `presentationCosts` useMemo had `persistedExpenses` missing from dependency array
  2. `calculatePresentationCost()` was not accepting `persistedExpenses` parameter
  3. So both sections were calling `calculateProductCostPerKg()` without persisted data
  4. Results: "Costo por Kilogramo" = updated, "Márgenes" = stale mock data

### Solution
1. Updated `calculatePresentationCost()` signature to accept optional `persistedExpenses` parameter
2. Pass `persistedExpenses` when calling `calculateProductCostPerKg()` inside it
3. In `costos-dashboard.tsx`:
   - Pass `persistedExpenses` to `calculatePresentationCost()` call (line 153)
   - Added `persistedExpenses` to useMemo dependency array (line 198)

### Result
- When user loads new productive expense in Gastos, both sections now update together
- "Análisis de Márgenes" uses the same real cost source as "Costo por Kilogramo"
- No more mock-data as primary source in margins section

### Files Modified
- `lib/mock-data.ts` - Updated `calculatePresentationCost()` signature
- `components/costos/costos-dashboard.tsx` - Pass persistedExpenses + add to deps

---

## BUG 2: Pedidos - Falta selector visible de categoría y precios desactualizados

### Root Cause
- Price category selector (`priceCategory`) existed in state but had NO visible UI element
- User couldn't explicitly choose: Barraca, Distribuidor, Oferta, Consumidor final
- Default 'barraca' was silent/invisible - not obvious to user they were locked into one category
- When user manually changed category in devtools/future enhancement, line prices didn't recalculate

### Solution
Added visible price category selector in Nuevo Pedido form:
1. Placed after Vendedor field for logical grouping
2. Shows all 4 categories (barraca, distribuidor, oferta, consumidor_final)
3. When user changes category:
   - Updates `priceCategory` state
   - Automatically recalculates ALL non-manual line prices using `getPriceDetailsFromStore()`
   - Manual-price lines stay untouched

### Result
- User sees clear selector to choose price channel
- Default 'barraca' is now explicit, not hidden
- When category changes, all line prices update instantly
- Manual price lines are protected from auto-recalc
- Price resolution now works for all category combinations

### Implementation Details
- Added Select component with 4 price categories
- `onValueChange` handler:
  - Updates `priceCategory` state
  - Maps through items array
  - Skips items with `manual_price = true`
  - Calls `getPriceDetailsFromStore()` with new category
  - Updates `unit_price` for auto-prices
- Works at add, update, and product selection time (existing code already uses `priceCategory` state)

### Files Modified
- `components/orders/order-form.tsx` - Added visible selector + recalc logic

---

## Verification Checklist

✅ **BUG 1 Fixed:**
- "Costo por Kilogramo" and "Análisis de Márgenes" now use same persistent expense source
- No mock-data as primary cost source in margins section
- Adding new productive expense updates both sections together

✅ **BUG 2 Fixed:**
- Visible price category selector in Nuevo Pedido form
- User can explicitly choose Barraca, Distribuidor, Oferta, Consumidor final
- Changing category recalculates all non-manual line prices
- Manual price lines protected
- Default category (barraca) now visible/explicit

---

## Files Changed
1. `lib/mock-data.ts` — `calculatePresentationCost()` function signature
2. `components/costos/costos-dashboard.tsx` — Pass persistedExpenses + dependency array
3. `components/orders/order-form.tsx` — Added price category selector + auto-recalc
