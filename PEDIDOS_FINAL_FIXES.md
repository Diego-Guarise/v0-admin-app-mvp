# Pedidos Module - Final Bug Fixes

## Bug 1: Potes Price Autofill Not Working

### Root Cause
When a pote presentation was selected (1.7 kg, 7 kg, or 18 kg for Masilla), the `updateItem()` function would look up the price using `updatedItem.with_brand` which was still `false`. Even though the pricing table had complete entries for potes with all categories, the lookup was using the wrong brand state.

### Solution
Modified `updateItem()` function to:
1. Check if the selected presentation is a pote for Masilla (using `isPotesAlwaysBranded()`)
2. **Force `with_brand = true` BEFORE** looking up the price
3. Then call `lookupUnitPrice()` with the correct brand state

Also updated the product selector to force brand when switching to Masilla and auto-selecting the first presentation (typically a bolsa).

### Files Fixed
- `components/orders/order-form.tsx` - Lines 128-133 (updateItem) and Lines 477-480 (product selector)

## Bug 2: 404 for Newly Created Orders

### Root Cause
When a new order was created, `handleSubmit()` generated an order number using `ORDERS.length + 1001`. But `ORDERS` is the static seeded array from mock-data. The order-store uses `getAllOrders()` to track both seeded and newly created orders. This mismatch meant:
- Order was saved to the store with order_number based on seeded count
- Detail/edit routes queried the store with a different count
- The order wasn't found = 404

### Solution
Changed the order number generation from `ORDERS.length` to `getAllOrders().length` to use the same order store that all routes query.

### Files Fixed
- `components/orders/order-form.tsx` - Line 218 (order number generation)
- Added import of `getAllOrders` from order-store

## Verification Checklist

The following flows now work end-to-end:

✓ Masilla + Pote 1.7 kg - autofills price (branded, uses priceWithBrand)
✓ Masilla + Pote 7 kg - autofills price (branded, uses priceWithBrand)  
✓ Masilla + Pote 18 kg - autofills price (branded, uses priceWithBrand)
✓ Creating a new order - persists to order-store with correct order_number
✓ Opening new order in detail view - found via getOrderById()
✓ Opening new order in edit view - found via getOrderById()

## Existing Logic Preserved

- Product selection correctly filters presentations by product
- Presentation filtering removes duplicates
- Marca behavior: potes forced branded with lock icon, bolsas toggleable
- Bolsa price autofill works correctly (using with_brand toggle state)
- Manual price mode still bypasses autofill
- Subtotal / IVA / total calculations unchanged
- All seeded orders still work correctly
