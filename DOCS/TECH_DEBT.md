# Technical Debt (Deuda Técnica)

## 1. Estrategia de Tokens en Media (`/api/media/proxy`)
**Estado Actual**: Se exigen URLs con `?token=dummyAuth123`, aislando de ataques públicos, pero carente de aserción criptográfica cruzada con el JWT global.
**Acción Requerida (Futuro Parche/Sprint)**:
- Implementar expedición de `One-Time Tokens` o JWTs de vida corta (ej. TTL 5 min) desde el backend cuando el Inbox solicita la lista de mensajes.
- El validador en `inbox.ts` no solo firmará el token, sino que extraerá el `userId` y buscará en `bot_members` si pertenece al `bot_id` dueño del asset solicitado.
- No depender de la simple opacidad del path del Bucket.

## 2. Testing y Cobertura E2E Visual
**Estado Actual**: Se testearon las tuberías internas y servicios lógicos (Vitest), pero Carecemos de End-to-End con Cypress / Playwright.

## 3. Retención de Medias (Buckets Limits)
**Estado Actual**: Supabase Storage acumulará de forma vitalicia los OGG provenientes de WhatsApp.
**Acción Requerida**: Cronjob o Bucket Policy nativa que purgue `/bot_id/conv_id/*.ogg` con antigüedad mayor a 60 días para eludir facturación masiva.
