# Implementation Notes (Sprint 0)

## Cómo correr todo
1. Navega a `f:/BotForge`
2. Corre `pnpm install` para resolver workspaces.
3. Corre `pnpm dev` para levantar Next.js y el API Hono API + Swagger.

## DB y Migraciones
Drizzle ORM está configurado bajo `packages/infrastructure/src/db/schema.ts`.
- Las migraciones deben correrse con `pnpm --filter @botforge/infrastructure db:generate`
- Para inicializar, necesitarás una `.env` con `DATABASE_URL` apuntando a Supabase.

## Seed base
- Todavía no incluido en Sprint 0, a incorporarse en Sprint 01 junto con primer deploy a DB de dev.

## Gates
Corren con Turbinepo:
- `pnpm run lint`
- `pnpm run typecheck`

## Proximos Pasos (Sprint 01)
- Conectar DB real a Supabase.
- Configurar Clerk/Supabase Auth real sobre la app Shell.
- Crear Modales interactivos del UI kit en el Bot List.
