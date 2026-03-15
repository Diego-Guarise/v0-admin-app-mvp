# Price Store Migration - Solución para Datos Persistidos Viejos

## CAUSA RAÍZ IDENTIFICADA

**Problema**: Los cambios de precios para Masilla 1kg/2kg (agregando branded prices por funda) quedaban solo en el seed inicial, pero si localStorage ya tenía datos viejos, nunca se aplicaban los cambios.

**Locación del bug**: En `lib/price-store.ts`, la función `getAllPrices()` líneas 98-130:
```typescript
if (stored) {
  const prices = JSON.parse(stored) as PriceListItem[]
  return prices  // ← Devuelve localStorage directamente sin verificar si está actualizado
}
return getSeedPrices()  // ← El seed solo se usa como fallback
```

El problema: Si localStorage existía, nunca se ejecutaba el seed actualizado, por lo que Masilla 2kg branded funda nunca se agregaba.

---

## SOLUCIÓN IMPLEMENTADA

### 1. **Función `needsMigration()` - Detección**
Verifica si el price store existente tiene la estructura vieja:
- Busca si existe `Masilla (prod-2) 2kg branded funda`
- Si NO existe → la data está vieja → `needsMigration()` devuelve `true`

```typescript
function needsMigration(prices: PriceListItem[]): boolean {
  const masilla2kgBranded = prices.find(p =>
    p.product_id === 'prod-2' &&
    p.presentation_id === 'pres-7' &&
    p.with_brand === true &&
    p.sales_unit_type === 'funda'
  )
  return !masilla2kgBranded
}
```

### 2. **Función `repairPriceStore()` - Reparación**
Regenera los precios faltantes sin eliminar datos existentes:
- Detecta el próximo ID disponible
- Crea solo los precios que faltan
- Los agrega al array existente
- No toca ningún otro precio

```typescript
function repairPriceStore(prices: PriceListItem[]): PriceListItem[] {
  // ... detecta y crea Masilla 2kg branded funda prices
  // ... verifica que no duplique
  // ... agrega solo lo que falta
}
```

### 3. **Updated `getAllPrices()` - Ejecución Automática**
Ahora verifica y repara automáticamente:
```typescript
export function getAllPrices(): PriceListItem[] {
  if (stored) {
    let prices = JSON.parse(stored) as PriceListItem[]
    
    if (needsMigration(prices)) {
      prices = repairPriceStore(prices)
      localStorage.setItem(PRICE_STORE_KEY, JSON.stringify(prices))
    }
    
    return prices
  }
  return getSeedPrices()
}
```

### 4. **Función `repairPricesManually()` - Reparación Manual**
Para emergencias o testing:
```typescript
export function repairPricesManually(): boolean {
  // Permite disparar manualmente la reparación
  // Útil para testing o si la reparación automática no se ejecutó
}
```

---

## CÓMO VERIFICAR QUE FUNCIONA

### Opción 1: Verificación Visual (Recomendada)
1. Abre Costos > Análisis de Márgenes
2. Selecciona "Masilla para Yeso" + "Con marca"
3. Busca "Bolsa 2 kg"
4. Debería mostrar:
   - **Costo por funda**: (costo unitario × 10)
   - **Precio por funda**: 480 (barraca) o 432 (distribuidor) o 384 (oferta)
   - **Margen**: Debe calcularse correctamente

### Opción 2: Verificación en Browser Console
```javascript
// En la consola del navegador:
// 1. Ver el precio de Masilla 2kg branded funda
const allPrices = JSON.parse(localStorage.getItem('fox-prices'))
allPrices.filter(p => 
  p.product_id === 'prod-2' && 
  p.presentation_id === 'pres-7' && 
  p.with_brand === true &&
  p.sales_unit_type === 'funda'
)

// Debería devolver 4 items (barraca, distribuidor, oferta, consumidor_final)
// Si no hay nada, significa que needsMigration falló en detectar
```

### Opción 3: Logs en la Consola
Cuando se ejecuta la reparación, verás:
```
[v0] Detected old price store format - repairing...
[v0] Added missing Masilla 2kg branded price for barraca
[v0] Added missing Masilla 2kg branded price for distribuidor
[v0] Added missing Masilla 2kg branded price for oferta
[v0] Price store repaired and saved
```

---

## TIMELINE DE EJECUCIÓN

1. **Primera carga después de la corrección**: `getAllPrices()` se ejecuta
2. **Detecta localStorage viejo**: `needsMigration()` devuelve `true`
3. **Repara datos**: `repairPriceStore()` agrega precios faltantes
4. **Guarda**: Los nuevos precios se persisten en localStorage
5. **Próximas cargas**: Los datos ya están completos, no necesita reparar

---

## ARCHIVOS MODIFICADOS

- `lib/price-store.ts` - Agregadas funciones de migración y reparación

## SEGURIDAD

✅ **No elimina datos**: Solo agrega lo que falta
✅ **No duplica**: Verifica antes de agregar
✅ **Automático pero reversible**: Se ejecuta al leer, pero si falla, el seed actúa de fallback
✅ **Loggea todo**: Console logs para auditar qué se reparó

---

## EN CASO DE PROBLEMAS

Si la preview sigue mostrando precios viejos:

### Opción A: Borrar localStorage (limpio)
```javascript
// En consola del navegador:
localStorage.removeItem('fox-prices')
// Recarga la página
```

### Opción B: Disparar reparación manual
```javascript
// En consola del navegador (si exportamos la función):
// Todavía no está disponible como función global, pero está en el código
```

---

## CONFIRMACIONES

✅ **Causa raíz**: Price store persistido en localStorage no se actualizaba cuando cambiaba el seed  
✅ **Key afectado**: `fox-prices` en localStorage  
✅ **Cambio aplicado**: `getAllPrices()` ahora detecta y repara automáticamente  
✅ **Verificación visual**: Masilla 2kg con marca mostrará precio por funda correcto (480/barraca, 432/dist, 384/oferta)
