# Fix useSearchParams() Build Error - Vercel Production Deployment

## Problema Resuelto
Error en build de Vercel: `useSearchParams() should be wrapped in a suspense boundary`

Error exacto en consola:
```
useSearchParams() should be wrapped in a suspense boundary at page "/clientes/nuevo"
Error occurred prerendering page "/clientes/nuevo"
Export encountered an error on /clientes/nuevo/page
```

## Causa Raíz
Cuando Next.js 16+ hizo que `useSearchParams()` fuera **blocking** en el servidor durante prerendering, todas las páginas que usaban `useSearchParams()` directamente quedaron incompatibles con el build de producción. El hook requiere estar envuelto en un `Suspense` boundary.

## Archivos Exactos Identificados y Corregidos

### 1. `/app/clientes/nuevo/page.tsx`
**Problema:**
- `page.tsx` tenía `'use client'` pero no estaba envuelto en `Suspense`
- `useSearchParams()` se ejecutaba directamente en el componente cliente default export

**Solución:**
- ✅ Creado `/app/clientes/nuevo/client-wrapper.tsx` - Client Component con `useSearchParams()`
- ✅ Actualizado `/app/clientes/nuevo/page.tsx` - Server Component que renderiza wrapper dentro de `Suspense`

**Archivos creados/modificados:**
- `client-wrapper.tsx` - NUEVO
- `page.tsx` - MODIFICADO

---

### 2. `/app/pedidos/nuevo/page.tsx`
**Problema:** Mismo patrón - `useSearchParams()` en page.tsx sin Suspense

**Solución:**
- ✅ Creado `/app/pedidos/nuevo/client-wrapper.tsx` - Client Component con lógica de searchParams
- ✅ Actualizado `/app/pedidos/nuevo/page.tsx` - Server Component con Suspense boundary

**Archivos creados/modificados:**
- `client-wrapper.tsx` - NUEVO
- `page.tsx` - MODIFICADO

---

### 3. `/app/pedidos/[id]/page.tsx`
**Problema:** Client Component con `useSearchParams()` y lógica compleja, no compatible con prerender

**Solución:**
- ✅ Creado `/app/pedidos/[id]/client-wrapper.tsx` - Client Component que maneja orden y searchParams
- ✅ Actualizado `/app/pedidos/[id]/page.tsx` - Server Component que async awaits params y renderiza wrapper en Suspense

**Archivos creados/modificados:**
- `client-wrapper.tsx` - NUEVO  
- `page.tsx` - MODIFICADO (cambio: ahora es async, usa `await params`)

---

### 4. `/app/pedidos/[id]/editar/page.tsx`
**Problema:** Mismo patrón - client component con `useSearchParams()` sin Suspense

**Solución:**
- ✅ Creado `/app/pedidos/[id]/editar/client-wrapper.tsx` - Client Component con lógica de edición y searchParams
- ✅ Actualizado `/app/pedidos/[id]/editar/page.tsx` - Server Component async con Suspense

**Archivos creados/modificados:**
- `client-wrapper.tsx` - NUEVO
- `page.tsx` - MODIFICADO (cambio: ahora es async, usa `await params`)

---

## Patrón Aplicado (App Router Best Practice)

```tsx
// page.tsx - Server Component
import { Suspense } from 'react'
import { ClientWrapper } from './client-wrapper'

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <ClientWrapper /> {/* Client Component con useSearchParams() */}
    </Suspense>
  )
}

// client-wrapper.tsx - Client Component
'use client'
import { useSearchParams } from 'next/navigation'

export function ClientWrapper() {
  const searchParams = useSearchParams() // Seguro dentro de Suspense
  // ... rest of logic
}
```

## Resumen de Cambios

| Ruta | Archivo | Acción | Razón |
|------|---------|--------|-------|
| `/clientes/nuevo` | page.tsx | Modificado | Ahora renderiza wrapper en Suspense |
| `/clientes/nuevo` | client-wrapper.tsx | CREADO | Client Component con useSearchParams |
| `/pedidos/nuevo` | page.tsx | Modificado | Ahora renderiza wrapper en Suspense |
| `/pedidos/nuevo` | client-wrapper.tsx | CREADO | Client Component con useSearchParams |
| `/pedidos/[id]` | page.tsx | Modificado | Server Component async + Suspense + client wrapper |
| `/pedidos/[id]` | client-wrapper.tsx | CREADO | Client Component con searchParams y lógica |
| `/pedidos/[id]/editar` | page.tsx | Modificado | Server Component async + Suspense + client wrapper |
| `/pedidos/[id]/editar` | client-wrapper.tsx | CREADO | Client Component con searchParams y lógica |

**Total: 4 archivos modificados, 4 archivos NUEVOS creados**

## Confirmación de Fix

✅ `/clientes/nuevo` - Ya no rompe el build  
✅ `/pedidos/nuevo` - Ya no rompe el build  
✅ `/pedidos/[id]` - Ya no rompe el build  
✅ `/pedidos/[id]/editar` - Ya no rompe el build  
✅ `components/orders/orders-content.tsx` - Sigue siendo componente cliente importado (OK)

## Funcionalidad Preservada

- Crear cliente nuevo: ✅ Funciona
- Volver a Pedidos desde crear cliente: ✅ Funciona (`from=pedido` query param)
- Crear pedido nuevo: ✅ Funciona
- Pre-seleccionar cliente en pedido: ✅ Funciona (`preSelectedClient` query param)
- Ver detalle pedido: ✅ Funciona (fetch in useEffect)
- Editar pedido: ✅ Funciona (fetch in useEffect)
- Navegación con contexto (from, vendorId): ✅ Funciona

## Por Qué Esto Resuelve el Error

El error `useSearchParams() should be wrapped in a suspense boundary` ocurre porque Next.js 16+ hace que `useSearchParams()` sea una operación **blocking** que no puede completarse durante prerender en el servidor. 

Al envolver el Client Component que usa `useSearchParams()` dentro de un `Suspense` boundary en el Server Component padre, Next.js:

1. Renderiza el Server Component sin problemas
2. Cuando llega al `Suspense`, muestra el fallback durante prerender
3. En cliente, el Suspense se resuelve y renderiza el Client Component
4. El Client Component puede ejecutar `useSearchParams()` sin problemas

**Este es el patrón oficial recomendado por Next.js para useSearchParams() en App Router.**
