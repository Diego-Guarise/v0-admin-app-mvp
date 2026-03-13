## Pedidos Module - Bug Fixes Summary

### Bug 1: Masilla para Yeso Selection Not Persisting

**Root Cause:**
The product selector was calling `updateItem()` twice sequentially (once for product_id, once for presentation_id). React's state batching was not optimal, causing the Select component to re-render with stale state before both updates completed. The controlled `value={item.product_id}` would lose sync with the actual state.

**Solution:**
Replaced the dual `updateItem()` calls with a single batched `setItems()` call that updates product_id, presentation_id, AND unit_price in one state update. This ensures:
- The product selection persists correctly
- The presentation immediately filters to valid options for the new product
- Price auto-fills for the new presentation in one atomic operation

**File Changed:** `components/orders/order-form.tsx` (lines 467-493)

---

### Bug 2: 404 When Opening Newly Created Orders

**Root Cause:**
The detail and edit pages were reading from the static `ORDERS` array imported from `mock-data.ts`. When orders were created in the form, they were added to that same array, but Next.js caches module imports. The routes would re-import mock-data on each request, getting a fresh copy of the static array without the newly created orders.

**Solution:**
Created a new `order-store.ts` that acts as an in-memory store for all orders (seeded + newly created). This file exports:
- `getAllOrders()` - returns all orders including newly created ones
- `getOrderById(id)` - fetches a specific order
- `saveOrder(order)` - adds/updates an order

Updated all relevant files to use this store:
- `order-form.tsx` - calls `saveOrder()` when creating/editing
- `orders-content.tsx` - calls `getAllOrders()` to show newly created orders in the list
- `app/pedidos/[id]/page.tsx` - uses `getOrderById()` for detail view
- `app/pedidos/[id]/editar/page.tsx` - uses `getOrderById()` for edit view

**Files Changed:**
- Created: `lib/order-store.ts`
- Updated: `components/orders/order-form.tsx`, `components/orders/orders-content.tsx`, `app/pedidos/[id]/page.tsx`, `app/pedidos/[id]/editar/page.tsx`

---

### Verification Checklist

✅ Masilla para Yeso can be selected and stays selected  
✅ Masilla presentations appear correctly after selection  
✅ New orders can be created  
✅ New orders appear in the list immediately  
✅ New orders can be opened in detail view (no 404)  
✅ New orders can be opened in edit view (no 404)  
✅ All existing working logic preserved:
  - Marca yes/no toggle
  - Potes forced branded
  - Automatic price autofill
  - Subtotal/IVA/Total calculations

---

### End-to-End Flow Now Works

1. User creates new order with "Masilla para Yeso"
2. Masilla presentations show (bolsas + potes)
3. Potes are locked to branded
4. Price autofills correctly
5. Order submits and saves to order store
6. User sees order in list immediately
7. User can click to view details (no 404)
8. User can click to edit (no 404)
9. Changes are saved back to store
