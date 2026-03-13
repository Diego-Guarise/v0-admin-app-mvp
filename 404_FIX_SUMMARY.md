404 FIX SUMMARY - Newly Created Orders Not Found in Detail/Edit Routes
=====================================================================

ROOT CAUSE
----------
The previous in-memory order store lost all newly created orders when navigating to detail/edit routes because:

1. Order creation happens on client (OrderForm component)
2. New orders saved to `allOrders` array in order-store.ts
3. User clicks link to `/pedidos/[id]` → new HTTP request
4. Server re-imports order-store module → `allOrders` reset to only SEEDED_ORDERS
5. `getOrderById()` on server couldn't find the newly created order → 404

THE FIX
-------
Implemented persistent storage using browser localStorage:

1. **order-store.ts**: Updated to use localStorage for newly created orders
   - `getAllOrders()` returns: SEEDED_ORDERS + localStorage data
   - `saveOrder()` persists to localStorage
   - Works in browser only (server-side returns empty array, client hydrates)

2. **Detail Page (/pedidos/[id]/page.tsx)**: Converted to client component
   - Now can access localStorage
   - Uses useEffect to unwrap params and lookup order
   - Shows loading state while resolving
   - Falls back to 404 if order not found

3. **Edit Page (/pedidos/[id]/editar/page.tsx)**: Converted to client component
   - Same pattern as detail page
   - Can now access newly created orders

KEY BEHAVIORS PRESERVED
-----------------------
✓ Product selection works correctly
✓ Masilla/pote selection works correctly
✓ Pote pricing auto-fills correctly
✓ Price autofill for all categories
✓ Manual price mode still works
✓ Order totals calculate correctly
✓ Seeded mock orders still accessible

COMPLETE FLOW NOW WORKS
------------------------
1. Create order in form → saved to localStorage
2. Navigate to /pedidos → list shows seeded + newly created orders
3. Click order in list → opens detail page correctly
4. Click edit → opens edit page correctly
5. Edit order → changes persisted to localStorage
6. All links resolve correctly

FILES FIXED
-----------
- lib/order-store.ts: Added localStorage persistence
- app/pedidos/[id]/page.tsx: Converted to client component with localStorage access
- app/pedidos/[id]/editar/page.tsx: Converted to client component with localStorage access
- components/orders/order-form.tsx: Removed temporary debug logging
