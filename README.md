# BotForge Monorepo

Plataforma Web/App Multi-Bot para WhatsApp basada en Clean Architecture.
Preparada para despliegues Edge/Cloudflare con Supabase.

## Estructura
- `apps/web`: Frontend Next.js (App Router)
- `apps/api`: Backend Hono + Swagger
- `packages/core`: Entidades de dominio y casos de uso base
- `packages/infrastructure`: Schemas Drizzle, auth, integraciones
- `packages/ui`: Componentes compartidos y Tailwind Config
- `packages/eslint-config` / `typescript-config`: Tooling base

## Scripts (Turborepo)
- `pnpm dev`: Inicia el entorno de desarrollo concurrente
- `pnpm build`: Compila todo el workspace
- `pnpm lint`: Corre linters
- `pnpm typecheck`: Verifica tipado TS en todo el repo

## Sprint 0 Entregables
- Infraestructura Base, UI Kit Placeholder, DB Schemas, Endpoints Startups.
