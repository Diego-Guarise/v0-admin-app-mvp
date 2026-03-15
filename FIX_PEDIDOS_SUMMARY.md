# Fix Pedidos (Orders) Module - Price Lookup Connection

## Problem Summary
The Orders (Pedidos) module lost the ability to show correct prices when adding/editing order lines. The root cause was that the code was calling `lookupUnitPrice()` which returns 0 because it couldn't work with the new price-store structure (which requires presentation_id, not product type/weight).

## What Was Broken
1. In "Nuevo Pedido", when selecting a product + presentation + category, the price showed as 0
2. The price category (Barraca, Distribuidor, Oferta, Consumidor final) wasn't being applied correctly
3. The total calculation was broken because unit_price was 0
4. The legacy `lookupUnitPrice()` function always returned 0 and had comments saying "recommend using getPriceByKey instead"

## Root Cause
The order-form.tsx was making three calls to `lookupUnitPrice(productId, presentationType, weightKg, withBrand, category)` which:
- Doesn't have access to the presentation_id
- Can't match prices in the price-store which uses presentation_id as the key
- Returns 0 by design (was a placeholder)

Meanwhile, `getPriceDetailsFromStore(productId, presentationId, withBrand, category)` **already exists** and works correctly with the real price-store.

## Solution Implemented

### 1. Updated `lib/pricing.ts`
- Reordered functions: `getPriceDetailsFromStore()` is now the primary recommended method
- `getPriceFromStore()` remains as a simpler variant returning just the price number
- Deprecated `lookupUnitPrice()` to only log a warning and return 0 (for backward compatibility, in case other code calls it)
- Added clear documentation that price-store is the source of truth

### 2. Updated `components/orders/order-form.tsx` (3 locations)
**Removed all 3 calls to `lookupUnitPrice()` and replaced with `getPriceDetailsFromStore()`:**

- **Line 171** (Add new item): Now gets price directly from store using presentation_id
- **Line 235** (Update item when fields change): Now gets price directly from store using presentation_id
- **Line 651** (Select product from table): Now gets price directly from store using presentation_id

All three cases now follow the same pattern:
```typescript
const priceDetails = getPriceDetailsFromStore(
  productId, 
  presentationId,      // ← This is the key difference!
  withBrand, 
  priceCategory
)
updatedItem.unit_price = priceDetails?.unit_price_for_sales_unit || 0
```

## Files Modified
1. **lib/pricing.ts** - Refactored to clarify getPriceDetailsFromStore() as primary method
2. **components/orders/order-form.tsx** - Fixed 3 price lookup calls to use correct price-store connection

## Architecture Preserved
✅ Price source of truth remains: `lib/price-store.ts`  
✅ price-store persists to localStorage and reads from defaults  
✅ All business rules maintained (bundle sizes, restrictions, brand rules)  
✅ Manual price override functionality preserved  
✅ All existing Order features intact (client search, vendor, invoice, etc.)  

## Testing Criteria
- ✅ In Nuevo Pedido: Select a product → price appears automatically
- ✅ Price category selection applies correctly
- ✅ Total calculation works (unit_price × quantity)
- ✅ Manual price override still works when toggled
- ✅ Duplicating order lines preserves prices
- ✅ No console errors about deprecated functions
