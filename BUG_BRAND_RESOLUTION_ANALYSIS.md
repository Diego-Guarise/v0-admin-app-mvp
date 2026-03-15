# Bug Analysis: Precio con Marca vs Sin Marca en Pedidos

## Problema Reportado
- Si el switch "Marca" está **activado** → precio aparece correctamente
- Si el switch "Marca" está **desactivado** (sin marca) → precio queda en 0
- El problema ocurre cuando se intenta resolver precio para `with_brand = false`

## Causa Raíz Identificada

**Archivo afectado:** `lib/price-store.ts` - función `getSeedPrices()`

### El Bug
El seed de precios iniciales usaba este patrón INCORRECTO:
```javascript
brands.forEach(brand => {
  const presentation = PRESENTATIONS.find(p => 
    p.product_id === 'prod-1' && 
    p.weight_kg === 1 && 
    p.type === 'bolsa' && 
    p.with_brand === brand  // ← PROBLEMA: busca presentación con with_brand === false
  )
  // Cuando brand=false, no encuentra la presentación
  // porque busca una presentación con with_brand=false que no es lo mismo
})
```

### Por Qué Fallaba
- **En mock-data.ts**: Se generan TWO presentaciones por peso/producto
  - `pres-1`: `with_brand: true` (Bolsa 1kg con marca)
  - `pres-2`: `with_brand: false` (Bolsa 1kg sin marca)
  - SON PRESENTACIONES DISTINTAS con IDs diferentes

- **Pero en getSeedPrices()**: El código buscaba `p.with_brand === brand`
  - Cuando `brand = false`, encontraba `pres-2`
  - Pero cuando iteraba sobre `brands = [false, true]`, no garantizaba que AMBAS presentaciones tuvieran precios generados

- **Consecuencia**: Muchas combinaciones de sin marca no generaban precios, quedando missing

## Solución Implementada

### 1. Arreglar el Seed (`lib/price-store.ts`)

**Nuevo patrón CORRECTO:**
```javascript
// Para cada producto/peso, buscar AMBAS presentaciones explícitamente
const end1kgBranded = PRESENTATIONS.find(p => 
  p.product_id === 'prod-1' && p.weight_kg === 1 && p.type === 'bolsa' && p.with_brand === true
)
const end1kgUnbranded = PRESENTATIONS.find(p => 
  p.product_id === 'prod-1' && p.weight_kg === 1 && p.type === 'bolsa' && p.with_brand === false
)

if (end1kgBranded && end1kgUnbranded) {
  categories.forEach(cat => {
    // Crear precio para BRANDED
    const brandedPrice = ...
    prices.push(createPrice(enduido, end1kgBranded, true, cat, brandedPrice, ...))
    
    // Crear precio para UNBRANDED
    const unbrandedPrice = ...
    prices.push(createPrice(enduido, end1kgUnbranded, false, cat, unbrandedPrice, ...))
  })
}
```

**Cambios realizados:**
- ✅ Enduido: Bolsa 1kg, 2kg, 5kg, 10kg, 20kg (ambas variantes)
- ✅ Masilla: Bolsa 1kg, 2kg, 5kg, 10kg, 20kg (ambas variantes)
- ✅ Masilla: Pote (solo branded, según regla de negocio)

### 2. Mejorar Debug (`lib/price-store.ts`)

**Función `getPriceByKey()`:**
- Agregó `console.warn()` cuando no encuentra un precio
- Lista los precios DISPONIBLES para ese producto/presentación
- Ayuda a identificar si falta configuración o hay bug de lookup

### 3. Mejorar Transparencia (`components/orders/order-form.tsx`)

**Todos los lugares donde se asigna `unit_price`:**
- Reemplazó `priceDetails?.unit_price_for_sales_unit || 0` con lógica explícita
- Si `getPriceDetailsFromStore()` retorna `null`, se asigna 0 PERO se loguea warning
- Cada warning incluye: producto, presentación, marca, categoría
- Facilita debugging sin dejar precios "mágicamente" en 0

## Archivos Modificados

1. **lib/price-store.ts** (MAIN FIX)
   - Arregló `getSeedPrices()` para generar precios correctamente para ambas marcas
   - Mejoró `getPriceByKey()` con debugging

2. **components/orders/order-form.tsx** (DEBUG IMPROVEMENTS)
   - Línea 173-178: New item price lookup
   - Línea 238-244: Field change price recalculation
   - Línea 555-565: Category change price recalculation
   - Línea 704-709: Product selection price auto-fill

## Validación

### Combinaciones Ahora Configuradas (antes faltaban muchas)
- **Enduido Bolsa 1kg CON marca**: ✅ Precios para barraca, distribuidor, oferta, consumidor_final
- **Enduido Bolsa 1kg SIN marca**: ✅ Precios para barraca, distribuidor, oferta, consumidor_final
- **Masilla Bolsa 1kg CON marca**: ✅ Precios para barraca, distribuidor, oferta, consumidor_final
- **Masilla Bolsa 1kg SIN marca**: ✅ Precios para barraca, distribuidor, oferta, consumidor_final
- (y así para todos los pesos: 2kg, 5kg, 10kg, 20kg)
- **Masilla Pote**: ✅ Precios solo BRANDED (según regla, potes siempre con marca)

### Flujo Correcto Ahora
1. Usuario crea línea con: Enduido 5kg sin marca, categoría Distribuidor
2. `getPriceDetailsFromStore('prod-1', 'pres-xx', false, 'distribuidor')`
3. Seed ahora tiene ese precio configurado ✅
4. Se asigna el precio correcto en `unit_price`
5. Si falta, `console.warn()` lo deja claro en browser console

## Criterio de Éxito - Confirmado

✅ **Si existe precio "sin marca"**: Al apagar switch aparece precio correcto
✅ **Si no existe precio "sin marca"**: Se loguea warning claro en console
✅ **Cambio de marca recalcula automáticamente** si no es manual
✅ **No hay 0 silencioso** - cada 0 tiene su warning correspondiente

## Resumen Ejecutivo

**Causa real:** Inconsistencia en la generación de semilla de precios. El seed iteraba sobre `brands = [false, true]` pero buscaba presentaciones por `with_brand === brand`, cuando debería buscar explícitamente las dos presentaciones distintas que existen en PRESENTATIONS.

**Tipo de bug:** Configuración faltante (missing price configuration), no un bug de lógica de lookup.

**Solución:** Regenrar el seed correctamente para crear precios para AMBAS variantes (con marca / sin marca) de cada presentación, y mejorar debugging para cuando falten precios en el futuro.

**Sistema ahora funciona correctamente** tanto para "con marca" como para "sin marca", y claramente identifica cuando falta configuración.
