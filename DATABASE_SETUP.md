# Database Setup - Fase 1: Infrastructure

## Overview

Esta es la Fase 1 de la migración de localStorage → PostgreSQL + Prisma. En esta fase solo se configura la infraestructura de base de datos sin modificar ninguno de los módulos actuales.

## Current Status

- ✅ Prisma instalado (`prisma@7.8.0`, `@prisma/client@7.8.0`)
- ✅ `DATABASE_URL` disponible desde Neon (integración conectada)
- ✅ `prisma/schema.prisma` con modelo `HealthCheck` básico
- ✅ `lib/db.ts` con singleton de `PrismaClient`
- ✅ API route `GET /api/db-health` para verificar conectividad
- ✅ Scripts Prisma en `package.json`

## Environment Variables

La variable `DATABASE_URL` está configurada automáticamente desde la integración Neon y es disponible durante el build y runtime.

**No es necesario agregarla manualmente al `.env.project`.**

## Available Scripts

```bash
# Push schema changes directly (no migration file)
pnpm prisma:push

# Open Prisma Studio UI to view/edit data
pnpm prisma:studio

# Regenerate Prisma Client (if needed)
pnpm prisma:generate
```

## Prisma Configuration for Fase 1+

- **Schema file:** `prisma/schema.prisma` (sin `url = env()`)
- **Config file:** `prisma/config.ts` (Prisma 7 requirement)
- **Local dev:** `.env.local` con `DATABASE_URL`
- **Build/Production:** La integración Neon proporciona `DATABASE_URL` automáticamente

## Troubleshooting

### Issue: "The datasource.url property is required in your Prisma config file"

**Solution:** Asegúrate de que:
1. `prisma.config.ts` existe y tiene `url: process.env.DATABASE_URL!`
2. `prisma/schema.prisma` NO tiene la línea `url = env("DATABASE_URL")`
3. Corre `pnpm prisma:push` directamente (sin `--name init`)

### Issue: "DATABASE_URL not available"

**Solution:** En local, crea `.env.local` con la conexión string:
```
DATABASE_URL="postgresql://..."
```

En Vercel/Preview, la integración Neon lo proporciona automáticamente.

## Next Steps

1. Verifica conectividad: `curl http://localhost:3000/api/db-health`
2. Abre Prisma Studio: `pnpm prisma:studio`
3. Una vez confirmado, avanza a Fase 2: Migración de Clientes y Vendedores
