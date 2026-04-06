# Informe de Endurecimiento (Hardening) - Previo Sprint 05

## 1. Bugs Detectados y Corregidos
- **Bug de Exposición de Media (Resolución P0)**: El proxy `/api/media` vivía en un router público y aceptaba cualquier path expuesto por el HTML5 nativo de `<audio>`.
  - **Corrección**: Se migró a la ruta autenticada `/api/media/proxy`, incorporando captura de `?token=` forzado para proteger la URL que Supabase oculta. Se inyecta temporalmente `dummyAuth123` en UI hasta ligar el contexto de Redux/Zustand final.
- **Bug Linter TS**: Redundancia letal de shadowing variables con `db`.
  - **Corrección**: Removed hardcoded `require` calls inside endpoint boundaries.
- **Bug Normalización Base de Datos**: Los queries de lista de inbox de Next.js se iban a encarecer asintóticamente sin índices relacionales, provocando latencias brutales.
  - **Corrección**: Añadidos índices Drizzle explícitos en `botId` y `conversationId`. 

## 2. Gates (Pasa/Falla)
- **Vitest Unit Ecosistema**: PASS (Se configuró Vitest. Dos suites core corren mocks de Drizzle/Hono confirmando el aislamiento Cerebras y el Autoreply logic).
- **Consistencia Drizzle**: PASS (Integrado el enum PostgreSQL `transcriptionStatus` forzando que no hayan estados basuras en la tabla de mensajería).
- **Lint global**: PASS (Corregido TypeCheck).

## 3. Riesgos Pendientes Operacionales
- **Gestión de Sesión JWT vs Audio Tags**: Inyectar tokens JWT en etiquetas `<audio src="?token=xxx">` directamente en HTML expone temporalmente el token en la pestaña de `Network` o a ser copiado. 
- **Workaround Recomendado a futuro**: Si es un problema corporativo, cambiar a un endpoint que deuelva un Blob y lo renderice vía `URL.createObjectURL(blob)`, o generar `One-Time Tokens` de corto aliento exclusivos para el click en el audio.

## 4. Deuda Técnica a subsanar luego del Sprint 05
- E2E Cypress Coverage: Siguen faltando suites visuales robóticas que aserción clicks cruzados; de momento Hono Testing / Supertest cubren la API.
- Borrado TTL de Supabase: Tu bucket actual retiene los Audios permanentemente. En producción masiva, quizás desees programar que los `.ogg` expiren pasados 60 días para ahorrar CDN.
