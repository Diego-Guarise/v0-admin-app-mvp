# Dashboard Real Data Integration - Summary

## Objective
Connect the FOX Admin main dashboard to real system data (orders and expenses) from persistent stores instead of hardcoded mock values.

## Changes Made

### 1. Created `lib/dashboard-stats.ts` (NEW FILE)
**Purpose**: Centralized calculation of dashboard metrics from real persistent stores

**Key Functions**:
- `calculateRealDashboardStats(month?)` - Reads from actual order and expense stores, filters by month, calculates totals
- `getDashboardMetrics(month?)` - Wrapper for React compatibility

**How it works**:
- Gets all orders from `order-store.ts` (combines seeded + persisted)
- Gets all expenses from `expenses-store.ts` (persisted only)
- Filters for current month (or specified month in YYYY-MM format)
- Excludes cancelled orders (`status !== 'anulado'`)
- Only includes active expenses (`status === 'activo'`)
- Calculates product totals (Enduido vs Masilla) by summing line_item weights by product_id

**Metrics calculated**:
1. `monthly_sales_without_iva` - Sum of order subtotals (base imponible)
2. `monthly_sales_with_iva` - Sum of order totals (with IVA)
3. `monthly_expenses` - Sum of active expenses
4. `enduido_kg_sold` - Total kg of Enduido (prod-1) sold
5. `masilla_kg_sold` - Total kg of Masilla (prod-2) sold

### 2. Updated `components/dashboard/dashboard-content.tsx`
**Changes**:
- Added `useEffect` hook to load real stats on client mount
- Replaced static `DASHBOARD_STATS` import with dynamic calculation
- Added state management (`stats`, `isHydrated`)
- Updates dynamically when orders/expenses change
- Changed subtitle descriptions to use current month name dynamically

**Data Flow**:
1. Component mounts → `useEffect` triggers
2. `calculateRealDashboardStats()` reads from stores
3. State updates → component re-renders with real values
4. Any subsequent order/expense creates → dashboard recalculates on navigation back

## Data Sources

### Orders (via `order-store.ts`)
- **Seeded**: From `lib/mock-data.ts` - demo orders for March 2025
- **Persisted**: New orders created in the app via localStorage (`app_created_orders`)
- **Combined**: `getAllOrders()` merges both sources

### Expenses (via `expenses-store.ts`)  
- **Only persisted data**: From localStorage (`app_expenses`)
- **Initialized**: With `initializeExpenses()` if first load
- **Accessed via**: `getExpenses()` which uses in-memory cache for performance

## Product Identification

Products are identified by their type for kg calculations:
- **prod-1**: Enduido Interior (sums to `enduido_kg_sold`)
- **prod-2**: Masilla para Yeso (sums to `masilla_kg_sold`)

Calculation done by iterating order line_items:
```
total_kg = quantity × weight_per_unit_kg
```

## Benefits

✅ **No mock data**: Dashboard shows actual persisted data from the system
✅ **Real-time**: Updates when new orders/expenses are created
✅ **Reactive**: Uses React hooks for proper hydration and state management
✅ **Month-aware**: Automatically uses current month, can filter by specific month
✅ **Excludes cancelled**: Respects order status (excludes `anulado`)
✅ **Active expenses only**: Filters `status === 'activo'`
✅ **Margin calculation**: Automatic from `sales_without_iva - expenses`

## Testing Checklist

1. **Load dashboard** → Should show 0s (if no data exists)
2. **Create new order in March 2025** → Reload dashboard → Ventas should update
3. **Create new expense in March 2025** → Reload dashboard → Gastos should update
4. **Check margin** → Should equal `Ventas sin IVA - Gastos`
5. **Add Enduido product** → `Enduido vendido` should reflect quantity × weight
6. **Add Masilla product** → `Masilla vendida` should reflect quantity × weight
7. **Create order with mixed products** → Both kg totals should update correctly

## Files Modified

| File | Changes |
|------|---------|
| `lib/dashboard-stats.ts` | NEW - Real data calculation engine |
| `components/dashboard/dashboard-content.tsx` | Updated to use real data via hooks |

## Backward Compatibility

- `lib/mock-data.ts` remains unchanged
- `DASHBOARD_STATS` constant still exists (not used by dashboard anymore)
- All other modules (Pedidos, Gastos, Costos) unaffected
- Seeded demo data still available for testing

## Future Enhancements

- Add month picker to view historical months
- Add loading skeleton while calculating stats
- Add data export/reporting features
- Migrate to backend API when database ready
